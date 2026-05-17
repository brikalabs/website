'use client';

import { useEffect, useRef } from 'react';

interface UseParticleBurstOptions {
  /** RGB triplet like "120, 90, 255". */
  color?: string;
  count?: number;
  /** Particle size in px. */
  size?: number;
  /** Drift radius in px. */
  spread?: number;
  /** Lifetime in ms before particle fades. */
  duration?: number;
}

/**
 * Hook that spawns a continuous, gentle particle drift on hover.
 *
 * Spawns DOM `<span>` particles inside the ref'd element, each animated by a
 * CSS keyframe (`particle-drift`) and removed on `animationend`. Stops on
 * pointer leave; honors `prefers-reduced-motion`.
 *
 * Attach `ref` to a `position: relative; overflow: hidden` element.
 */
export function useParticleBurst<T extends HTMLElement = HTMLElement>({
  color = '120, 90, 255',
  count = 8,
  size = 4,
  spread = 60,
  duration = 1600,
}: UseParticleBurstOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let interval: ReturnType<typeof setInterval> | null = null;

    function spawnParticle() {
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
      p.style.background = `rgba(${color}, 0.9)`;
      p.style.boxShadow = `0 0 10px rgba(${color}, 0.6)`;
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
      for (let i = 0; i < Math.min(3, count); i++) {
        spawnParticle();
      }
      interval = setInterval(spawnParticle, Math.max(80, duration / count));
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
  }, [color, count, size, spread, duration]);

  return ref;
}
