'use client';

import { type RefObject, useEffect, useState } from 'react';

/** Face options. All exactly 3 columns wide so the mascot box never reflows. */
const FACES = {
  happy: '^◡^',
  blink: '-◡-',
  wink: '^◡-',
  curious: '•◡•',
  wide: 'O◡O',
} as const;

const FACE_VARIANTS = [FACES.blink, FACES.wink, FACES.curious, FACES.wide];

/**
 * Measure the container's effective character columns. Renders a hidden
 * monospace ruler inside `ref`, divides container width by the ruler's
 * per-char width to get a live `cols` value that updates on resize.
 *
 * Mirrors what the real TUI does — it queries the terminal's `columns × rows`
 * via stdout's `getWindowSize()` and lays out accordingly. Here the
 * "terminal" is the Terminal component's inner viewport.
 */
export function useColumns(ref: RefObject<HTMLElement | null>, fallback = 80): number {
  const [cols, setCols] = useState(fallback);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const ruler = document.createElement('span');
    ruler.style.cssText =
      'position:absolute;visibility:hidden;white-space:pre;padding:0;margin:0;left:-9999px;';
    ruler.textContent = '0'.repeat(80);
    el.appendChild(ruler);

    function measure() {
      if (!el) {
        return;
      }
      const charWidth = ruler.getBoundingClientRect().width / 80;
      const w = el.getBoundingClientRect().width;
      if (charWidth > 0 && w > 0) {
        setCols(Math.max(40, Math.floor(w / charWidth)));
      }
    }

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    return () => {
      ro.disconnect();
      ruler.remove();
    };
  }, [ref]);

  return cols;
}

type TypewriterPhase = 'type' | 'hold' | 'erase';

/**
 * Typewriter: types each message char-by-char, holds, erases, advances.
 * Returns the currently-visible text and whether to show a holding cursor.
 */
export function useTypewriter(messages: string[]) {
  const [text, setText] = useState('');
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<TypewriterPhase>('type');

  useEffect(() => {
    const target = messages[idx];

    if (phase === 'type') {
      if (text.length < target.length) {
        const id = setTimeout(
          () => setText(target.slice(0, text.length + 1)),
          45 + Math.random() * 40
        );
        return () => clearTimeout(id);
      }
      const id = setTimeout(() => setPhase('hold'), 3200);
      return () => clearTimeout(id);
    }

    if (phase === 'hold') {
      const id = setTimeout(() => setPhase('erase'), 400);
      return () => clearTimeout(id);
    }

    // erase
    if (text.length > 0) {
      const id = setTimeout(() => setText(text.slice(0, -1)), 22);
      return () => clearTimeout(id);
    }

    setIdx((i) => (i + 1) % messages.length);
    setPhase('type');
  }, [phase, text, idx, messages]);

  return { text, blinking: phase === 'hold' };
}

/**
 * Random blink / wink animation — mostly stays on happy, occasionally flicks
 * to another expression for ~180ms with non-rhythmic timing (2.5–5.5s).
 */
export function useBlinkingFace(): string {
  const [face, setFace] = useState<string>(FACES.happy);

  useEffect(() => {
    let id: ReturnType<typeof setTimeout>;

    function schedule() {
      id = setTimeout(
        () => {
          const next = FACE_VARIANTS[Math.floor(Math.random() * FACE_VARIANTS.length)];
          setFace(next);
          id = setTimeout(() => {
            setFace(FACES.happy);
            schedule();
          }, 180);
        },
        2500 + Math.random() * 3000
      );
    }

    schedule();
    return () => clearTimeout(id);
  }, []);

  return face;
}
