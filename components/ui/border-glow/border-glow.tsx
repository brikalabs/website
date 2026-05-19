'use client';

import {
  type CSSProperties,
  forwardRef,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { cn } from '@/lib/utils';
import './border-glow.css';

export interface BorderGlowProps {
  children?: ReactNode;
  className?: string;
  innerClassName?: string;
  /** How close the pointer must be to the edge for the glow to appear (0-100). */
  edgeSensitivity?: number;
  /** HSL values for the outer glow, as "H S L" (e.g. "40 80 80"). */
  glowColor?: string;
  /** Background color of the card. Defaults to var(--surface). */
  backgroundColor?: string;
  /** Corner radius of the card in pixels. */
  borderRadius?: number;
  /** How far the outer glow extends beyond the card in pixels. */
  glowRadius?: number;
  /** Multiplier for glow opacity (0.1-3.0). */
  glowIntensity?: number;
  /** Width of the directional cone mask as a percentage (5-45). */
  coneSpread?: number;
  /** Play an intro sweep animation on mount. */
  animated?: boolean;
  /** Continuously rotate the cone — overrides cursor tracking. */
  spin?: boolean;
  /** Spin period when `spin` is enabled. */
  spinDuration?: string;
  /** Enable 3D mouse-tracking tilt — perspective + rotateX/rotateY. */
  tilt?: boolean;
  /** Max degrees of tilt at the corners (default 8). */
  tiltIntensity?: number;
  /** Enable cursor-following radial color glow inside the card. */
  colorGlow?: boolean;
  /** Color for the inner cursor-following glow (any CSS color). */
  colorGlowAccent?: string;
  /** Enable particle burst on hover. */
  particles?: boolean;
  /** RGB triplet like "120, 90, 255" for the particle color. */
  particlesColor?: string;
  /** Particle count target (defaults to 6). */
  particlesCount?: number;
  /** Render the outer-glow halo layer. Disable on dense/small cards to
   *  skip a mix-blend-mode compositing layer per instance. Default true. */
  halo?: boolean;
  /** 3 hex colors for the mesh gradient border, distributed across positions. */
  colors?: readonly [string, string, string];
  /** Soft-light mesh fill opacity (0-1). */
  fillOpacity?: number;
  /** Baseline opacity (0-1) for the border ring when not hovered. */
  idleOpacity?: number;
  style?: CSSProperties;
}

interface HSL {
  h: number;
  s: number;
  l: number;
}

const DEFAULT_COLORS = ['#c084fc', '#f472b6', '#38bdf8'] as const;
const HSL_REGEX = /([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/;

function parseHSL(hslStr: string): HSL {
  const match = HSL_REGEX.exec(hslStr);
  if (!match) {
    return { h: 40, s: 80, l: 80 };
  }
  return {
    h: Number.parseFloat(match[1]),
    s: Number.parseFloat(match[2]),
    l: Number.parseFloat(match[3]),
  };
}

const GLOW_OPACITIES = [100, 60, 50, 40, 30, 20, 10] as const;
const GLOW_KEYS = ['', '-60', '-50', '-40', '-30', '-20', '-10'] as const;

function buildGlowVars(glowColor: string, intensity: number): Record<string, string> {
  const { h, s, l } = parseHSL(glowColor);
  const base = `${h}deg ${s}% ${l}%`;
  const vars: Record<string, string> = {};
  for (let i = 0; i < GLOW_OPACITIES.length; i++) {
    const opacity = Math.min(GLOW_OPACITIES[i] * intensity, 100);
    vars[`--glow-color${GLOW_KEYS[i]}`] = `hsl(${base} / ${opacity}%)`;
  }
  return vars;
}

const GRADIENT_POSITIONS = [
  '80% 55%',
  '69% 34%',
  '8% 6%',
  '41% 38%',
  '86% 85%',
  '82% 18%',
  '51% 4%',
] as const;
const GRADIENT_KEYS = [
  '--gradient-one',
  '--gradient-two',
  '--gradient-three',
  '--gradient-four',
  '--gradient-five',
  '--gradient-six',
  '--gradient-seven',
] as const;
const COLOR_MAP = [0, 1, 2, 0, 1, 2, 1] as const;

function buildGradientVars(colors: readonly string[]): Record<string, string> {
  const vars: Record<string, string> = {};
  for (let i = 0; i < GRADIENT_KEYS.length; i++) {
    const c = colors[Math.min(COLOR_MAP[i], colors.length - 1)];
    vars[GRADIENT_KEYS[i]] =
      `radial-gradient(at ${GRADIENT_POSITIONS[i]}, ${c} 0px, transparent 50%)`;
  }
  vars['--gradient-base'] = `linear-gradient(${colors[0]} 0 100%)`;
  return vars;
}

function easeOutCubic(x: number): number {
  return 1 - (1 - x) ** 3;
}

function easeInCubic(x: number): number {
  return x * x * x;
}

interface AnimateOpts {
  start?: number;
  end?: number;
  duration?: number;
  delay?: number;
  ease?: (x: number) => number;
  onUpdate: (v: number) => void;
  onEnd?: () => void;
}

function animateValue({
  start = 0,
  end = 100,
  duration = 1000,
  delay = 0,
  ease = easeOutCubic,
  onUpdate,
  onEnd,
}: AnimateOpts): () => void {
  let cancelled = false;
  let rafId = 0;
  const t0 = performance.now() + delay;

  function tick(): void {
    if (cancelled) {
      return;
    }
    const elapsed = performance.now() - t0;
    const t = Math.min(elapsed / duration, 1);
    onUpdate(start + (end - start) * ease(t));
    if (t < 1) {
      rafId = requestAnimationFrame(tick);
    } else if (onEnd) {
      onEnd();
    }
  }

  const timeoutId = globalThis.setTimeout(() => {
    rafId = requestAnimationFrame(tick);
  }, delay);

  return () => {
    cancelled = true;
    globalThis.clearTimeout(timeoutId);
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  };
}

function getEdgeProximity(width: number, height: number, x: number, y: number): number {
  const cx = width / 2;
  const cy = height / 2;
  const dx = x - cx;
  const dy = y - cy;
  let kx = Number.POSITIVE_INFINITY;
  let ky = Number.POSITIVE_INFINITY;
  if (dx !== 0) {
    kx = cx / Math.abs(dx);
  }
  if (dy !== 0) {
    ky = cy / Math.abs(dy);
  }
  return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
}

function getCursorAngle(width: number, height: number, x: number, y: number): number {
  const cx = width / 2;
  const cy = height / 2;
  const dx = x - cx;
  const dy = y - cy;
  if (dx === 0 && dy === 0) {
    return 0;
  }
  let degrees = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
  if (degrees < 0) {
    degrees += 360;
  }
  return degrees;
}

function runIntroSweep(card: HTMLDivElement): () => void {
  const angleStart = 110;
  const angleEnd = 465;
  card.classList.add('sweep-active');
  card.style.setProperty('--cursor-angle', `${angleStart}deg`);

  const cancels = [
    animateValue({
      duration: 500,
      onUpdate: (v) => card.style.setProperty('--edge-proximity', String(v)),
    }),
    animateValue({
      ease: easeInCubic,
      duration: 1500,
      end: 50,
      onUpdate: (v) => {
        card.style.setProperty(
          '--cursor-angle',
          `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`
        );
      },
    }),
    animateValue({
      ease: easeOutCubic,
      delay: 1500,
      duration: 2250,
      start: 50,
      end: 100,
      onUpdate: (v) => {
        card.style.setProperty(
          '--cursor-angle',
          `${(angleEnd - angleStart) * (v / 100) + angleStart}deg`
        );
      },
    }),
    animateValue({
      ease: easeInCubic,
      delay: 2500,
      duration: 1500,
      start: 100,
      end: 0,
      onUpdate: (v) => card.style.setProperty('--edge-proximity', String(v)),
      onEnd: () => card.classList.remove('sweep-active'),
    }),
  ];

  return () => {
    for (const c of cancels) {
      c();
    }
    card.classList.remove('sweep-active');
  };
}

export const BorderGlow = forwardRef<HTMLDivElement, BorderGlowProps>(function BorderGlow(
  {
    children,
    className,
    innerClassName,
    edgeSensitivity = 30,
    glowColor = '40 80 80',
    backgroundColor,
    borderRadius = 28,
    glowRadius = 40,
    glowIntensity = 1,
    coneSpread = 25,
    animated = false,
    spin = false,
    spinDuration = '6s',
    tilt = false,
    tiltIntensity = 8,
    colorGlow = false,
    colorGlowAccent,
    particles = false,
    particlesColor = '120, 90, 255',
    particlesCount = 6,
    halo = true,
    colors = DEFAULT_COLORS,
    fillOpacity = 0.5,
    idleOpacity = 0,
    style,
  },
  forwardedRef
) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef(0);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      cardRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef]
  );

  const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) {
      return;
    }
    const x = e.clientX;
    const y = e.clientY;
    if (frameRef.current) {
      return;
    }
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const el = cardRef.current;
      if (!el) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const localX = x - rect.left;
      const localY = y - rect.top;
      const edge = getEdgeProximity(rect.width, rect.height, localX, localY);
      const angle = getCursorAngle(rect.width, rect.height, localX, localY);
      el.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
      el.style.setProperty('--cursor-angle', `${angle.toFixed(3)}deg`);
    });
  }, []);

  useEffect(() => {
    if (!animated) {
      return;
    }
    const card = cardRef.current;
    if (!card) {
      return;
    }
    if (globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    return runIntroSweep(card);
  }, [animated]);

  useEffect(() => {
    if (!spin) {
      return;
    }
    const card = cardRef.current;
    if (!card) {
      return;
    }
    if (globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      card.style.setProperty('--edge-proximity', '100');
      return;
    }
    const periodMs = Number.parseFloat(spinDuration) * 1000 || 6000;
    let raf = 0;
    const t0 = performance.now();
    function tick(now: number): void {
      const angle = ((now - t0) / periodMs) * 360;
      card?.style.setProperty('--cursor-angle', `${angle % 360}deg`);
      card?.style.setProperty('--edge-proximity', '100');
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spin, spinDuration]);

  useEffect(() => {
    if (!tilt) {
      return;
    }
    const el = cardRef.current;
    if (!el) {
      return;
    }
    let frame = 0;
    let lastX = 0;
    let lastY = 0;
    function onMove(e: MouseEvent) {
      lastX = e.clientX;
      lastY = e.clientY;
      if (frame) {
        return;
      }
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!el) {
          return;
        }
        const rect = el.getBoundingClientRect();
        const x = (lastX - rect.left) / rect.width;
        const y = (lastY - rect.top) / rect.height;
        el.style.setProperty('--mx', `${x}`);
        el.style.setProperty('--my', `${y}`);
        el.style.setProperty('--rx', `${(y - 0.5) * -tiltIntensity}`);
        el.style.setProperty('--ry', `${(x - 0.5) * tiltIntensity}`);
      });
    }
    function onLeave() {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      el?.style.setProperty('--rx', '0');
      el?.style.setProperty('--ry', '0');
    }
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      if (frame) {
        cancelAnimationFrame(frame);
      }
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [tilt, tiltIntensity]);

  useEffect(() => {
    if (!particles) {
      return;
    }
    const el = cardRef.current;
    if (!el) {
      return;
    }
    if (globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    let interval: ReturnType<typeof setInterval> | null = null;
    const size = 3;
    const spread = 80;
    const duration = 1600;
    function spawn() {
      if (!el) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const startX = Math.random() * rect.width;
      const startY = Math.random() * rect.height;
      const angle = Math.random() * Math.PI * 2;
      const dist = spread * (0.4 + Math.random() * 0.6);
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist - 20;
      const p = document.createElement('span');
      p.className = 'pointer-events-none absolute rounded-full';
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${startX}px`;
      p.style.top = `${startY}px`;
      p.style.background = `rgba(${particlesColor}, 0.9)`;
      p.style.boxShadow = `0 0 10px rgba(${particlesColor}, 0.6)`;
      p.style.setProperty('--p-dx', `${dx}px`);
      p.style.setProperty('--p-dy', `${dy}px`);
      p.style.animation = `particle-drift ${duration}ms cubic-bezier(0.16, 1, 0.3, 1) forwards`;
      p.addEventListener('animationend', () => p.remove(), { once: true });
      el.appendChild(p);
    }
    function start() {
      if (interval) {
        return;
      }
      for (let i = 0; i < Math.min(3, particlesCount); i++) {
        spawn();
      }
      interval = setInterval(spawn, Math.max(80, duration / particlesCount));
    }
    function stop() {
      if (interval) {
        clearInterval(interval);
      }
      interval = null;
    }
    el.addEventListener('pointerenter', start);
    el.addEventListener('pointerleave', stop);
    return () => {
      el.removeEventListener('pointerenter', start);
      el.removeEventListener('pointerleave', stop);
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [particles, particlesColor, particlesCount]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const mergedStyle: CSSProperties = {
    '--edge-sensitivity': edgeSensitivity,
    '--border-radius': `${borderRadius}px`,
    '--glow-padding': `${glowRadius}px`,
    '--cone-spread': coneSpread,
    '--fill-opacity': fillOpacity,
    '--idle-opacity': idleOpacity,
    '--spin-duration': spinDuration,
    ...(backgroundColor ? { '--card-bg': backgroundColor } : null),
    ...(colorGlowAccent ? { '--card-accent': colorGlowAccent } : null),
    ...buildGlowVars(glowColor, glowIntensity),
    ...buildGradientVars(colors),
    ...style,
  } as CSSProperties;

  return (
    <div
      ref={setRefs}
      onPointerMove={spin ? undefined : handlePointerMove}
      className={cn(
        'group border-glow-card',
        spin && 'spin',
        tilt && 'tilt-card will-change-transform',
        className
      )}
      style={mergedStyle}
    >
      {halo && <span aria-hidden className="edge-light" />}
      {colorGlow && (
        <span
          aria-hidden
          className="tilt-card-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
      <div className={cn('border-glow-inner', innerClassName)}>{children}</div>
    </div>
  );
});
