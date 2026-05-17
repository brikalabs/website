'use client';

import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SpotlightCardsProps {
  children: ReactNode;
  className?: string;
  /** RGB triplet like "132, 0, 255" — used for the spotlight glow. */
  glowColor?: string;
  /** Cursor proximity radius in px before the glow starts ramping. */
  radius?: number;
}

/**
 * Magic-Bento style global spotlight.
 *
 * Wrap a grid of cards (each opted-in via `data-spotlight-card` attribute).
 * A single `<div>` follows the cursor across the wrapper and writes
 * `--glow-x/y/intensity` CSS vars on each card based on cursor distance.
 *
 * Drives the `.spotlight-card` styles in globals.css.
 */
export function SpotlightCards({
  children,
  className,
  glowColor = '120, 90, 255',
  radius = 320,
}: Readonly<SpotlightCardsProps>) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const wrapper = wrapperRef.current;
    const spot = spotRef.current;
    if (!wrapper || !spot) {
      return;
    }

    if (globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const proximity = radius * 0.5;
    const fade = radius * 0.75;

    function update(x: number, y: number) {
      const wrap = wrapper;
      const dot = spot;
      if (!wrap || !dot) {
        return;
      }
      dot.style.transform = `translate3d(${x - radius}px, ${y - radius}px, 0)`;
      dot.style.opacity = '1';

      const cards = wrap.querySelectorAll<HTMLElement>('[data-spotlight-card]');
      cards.forEach((card) => {
        const r = card.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.hypot(dx, dy) - Math.max(r.width, r.height) / 2;
        let intensity = 0;
        if (dist <= proximity) {
          intensity = 1;
        } else if (dist <= fade) {
          intensity = (fade - dist) / (fade - proximity);
        }
        card.style.setProperty('--glow-x', `${x - r.left}px`);
        card.style.setProperty('--glow-y', `${y - r.top}px`);
        card.style.setProperty('--glow-intensity', intensity.toFixed(3));
        card.style.setProperty('--glow-radius', `${radius}px`);
      });
    }

    function onMove(e: PointerEvent) {
      if (frame.current) {
        return;
      }
      const x = e.clientX;
      const y = e.clientY;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        update(x, y);
      });
    }

    function onLeave() {
      if (frame.current) {
        cancelAnimationFrame(frame.current);
      }
      frame.current = 0;
      const dot = spot;
      if (dot) {
        dot.style.opacity = '0';
      }
      const cards = wrapper?.querySelectorAll<HTMLElement>('[data-spotlight-card]');
      cards?.forEach((card) => {
        card.style.setProperty('--glow-intensity', '0');
      });
    }

    globalThis.addEventListener('pointermove', onMove, { passive: true });
    wrapper.addEventListener('pointerleave', onLeave);
    return () => {
      globalThis.removeEventListener('pointermove', onMove);
      wrapper.removeEventListener('pointerleave', onLeave);
      if (frame.current) {
        cancelAnimationFrame(frame.current);
      }
    };
  }, [radius]);

  const spotStyle: CSSProperties = {
    width: radius * 2,
    height: radius * 2,
    background: `radial-gradient(circle, rgba(${glowColor}, 0.18) 0%, rgba(${glowColor}, 0.08) 25%, transparent 70%)`,
  };

  return (
    <div
      ref={wrapperRef}
      className={cn('relative', className)}
      style={{ '--spotlight-glow': glowColor } as CSSProperties}
    >
      {mounted && (
        <div
          ref={spotRef}
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-[1] opacity-0 mix-blend-screen transition-opacity duration-200"
          style={spotStyle}
        />
      )}
      {children}
    </div>
  );
}
