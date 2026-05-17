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
 * Listeners are attached via `addEventListener` in `useEffect` rather than
 * React `onMouse*` props — that way the consumer's wrapping div has no
 * interactive event handlers and Sonar's S6848 / a11y rules don't flag it.
 *
 * Mousemove is rAF-throttled: regardless of pointer sample rate (60–240Hz),
 * style writes happen at most once per frame.
 */
export function useTilt3D<T extends HTMLElement = HTMLElement>(intensity = 10) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
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
        el.style.setProperty('--rx', `${(y - 0.5) * -intensity}`);
        el.style.setProperty('--ry', `${(x - 0.5) * intensity}`);
      });
    }

    function onLeave() {
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      if (!el) {
        return;
      }
      el.style.setProperty('--rx', '0');
      el.style.setProperty('--ry', '0');
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
  }, [intensity]);

  return ref;
}
