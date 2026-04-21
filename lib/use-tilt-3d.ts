import { useEffect, useRef } from 'react';

/**
 * 3D tilt effect driven by CSS custom properties.
 *
 * Writes `--mx`, `--my` (0–1 cursor position) and `--rx`, `--ry` (degrees)
 * on the element. Pair with CSS:
 *
 * ```css
 * transform: perspective(600px) rotateX(calc(var(--rx)*1deg)) rotateY(calc(var(--ry)*1deg));
 * ```
 *
 * The rect is snapshotted on pointer enter and reused for the whole hover
 * session. `getBoundingClientRect()` returns the element's *transformed* box,
 * so reading it every frame creates a feedback loop (tilt changes rect → next
 * frame reads a different rect → tilt jitters). Snapshotting breaks the loop.
 *
 * Mousemove is rAF-throttled: regardless of pointer sample rate (60–240Hz),
 * style writes happen at most once per frame.
 */
export function useTilt3D<T extends HTMLElement = HTMLElement>(intensity = 10) {
  const ref = useRef<T>(null);
  const frame = useRef(0);
  const coords = useRef({ x: 0, y: 0 });
  const rect = useRef<DOMRect | null>(null);

  useEffect(() => {
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, []);

  function onMouseEnter(e: React.MouseEvent<T>) {
    const el = ref.current;
    if (!el) return;
    rect.current = el.getBoundingClientRect();
    coords.current.x = e.clientX;
    coords.current.y = e.clientY;
  }

  function onMouseMove(e: React.MouseEvent<T>) {
    coords.current.x = e.clientX;
    coords.current.y = e.clientY;
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const el = ref.current;
      if (!el) {
        return;
      }
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      el.style.setProperty('--mx', `${x}`);
      el.style.setProperty('--my', `${y}`);
      el.style.setProperty('--rx', `${(y - 0.5) * -intensity}`);
      el.style.setProperty('--ry', `${(x - 0.5) * intensity}`);
    });
  }

  function onMouseLeave() {
    if (frame.current) {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    }
    rect.current = null;
    const el = ref.current;
    if (!el) {
      return;
    }
    el.style.setProperty('--rx', '0');
    el.style.setProperty('--ry', '0');
  }

  return { ref, onMouseEnter, onMouseMove, onMouseLeave } as const;
}
