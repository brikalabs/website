'use client';

import { AnimatePresence, motion, type Transition } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type StaggerFrom = 'first' | 'last' | 'center' | number;

interface RotatingTextProps {
  texts: string[];
  /** Milliseconds between rotations. */
  rotationInterval?: number;
  /** Per-character stagger delay in seconds. */
  staggerDuration?: number;
  staggerFrom?: StaggerFrom;
  transition?: Transition;
  /** Loop back to the first text after the last. */
  loop?: boolean;
  /** Class applied to the outer wrapper (the inline-flex container). */
  className?: string;
  /** Class applied to the per-word clipping container (where overflow-hidden lives). */
  wordClassName?: string;
  /** Class applied to each animated character span. */
  charClassName?: string;
}

const splitIntoGraphemes = (text: string): string[] => {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  return Array.from(text);
};

/**
 * Rotates through `texts`, animating per character with a vertical slide.
 *
 * The clipping happens on the word-level wrapper (not the outer one) so the
 * outer can sit on the baseline cleanly. `pb-[0.18em]` on the word wrapper
 * gives descenders (g, p, y, etc.) room without exposing the slide region.
 */
export function RotatingText({
  texts,
  rotationInterval = 2800,
  staggerDuration = 0.025,
  staggerFrom = 'last',
  transition = { type: 'spring', damping: 30, stiffness: 400 },
  loop = true,
  className,
  wordClassName,
  charClassName,
}: Readonly<RotatingTextProps>) {
  const [index, setIndex] = useState(0);

  const characters = useMemo(() => splitIntoGraphemes(texts[index] ?? ''), [texts, index]);

  useEffect(() => {
    if (texts.length <= 1) {
      return;
    }
    const id = setInterval(() => {
      setIndex((prev) => {
        if (prev === texts.length - 1) {
          return loop ? 0 : prev;
        }
        return prev + 1;
      });
    }, rotationInterval);
    return () => clearInterval(id);
  }, [texts.length, rotationInterval, loop]);

  const total = characters.length;
  const getDelay = (i: number): number => {
    if (staggerFrom === 'first') {
      return i * staggerDuration;
    }
    if (staggerFrom === 'last') {
      return (total - 1 - i) * staggerDuration;
    }
    if (staggerFrom === 'center') {
      return Math.abs(Math.floor(total / 2) - i) * staggerDuration;
    }
    return Math.abs(staggerFrom - i) * staggerDuration;
  };

  return (
    <motion.span
      className={cn('relative inline-flex align-baseline', className)}
      layout
      transition={transition}
    >
      <span className="sr-only">{texts[index]}</span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={index}
          className={cn('inline-flex overflow-hidden pb-[0.18em]', wordClassName)}
          aria-hidden="true"
          layout
        >
          {characters.map((char, i) => (
            <motion.span
              key={`${char}-${i}`}
              className={cn('inline-block', charClassName)}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-120%' }}
              transition={{ ...transition, delay: getDelay(i) }}
            >
              {char === ' ' ? ' ' : char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
