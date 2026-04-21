'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function ThemeToggle() {
  const ref = useRef<HTMLButtonElement>(null);
  const [dark, setDark] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    mounted.current = true;
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      return;
    }
    document.documentElement.classList.toggle('dark', dark);
    document.cookie = `theme=${dark ? 'dark' : 'light'}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; samesite=lax`;
  }, [dark]);

  const toggle = async () => {
    const btn = ref.current;
    if (
      !btn ||
      !('startViewTransition' in document) ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setDark((v) => !v);
      return;
    }

    const { top, left, width, height } = btn.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const maxRadius = Math.max(
      Math.hypot(x, y),
      Math.hypot(innerWidth - x, y),
      Math.hypot(x, innerHeight - y),
      Math.hypot(innerWidth - x, innerHeight - y)
    );

    await document.startViewTransition(() => {
      flushSync(() => setDark((v) => !v));
    }).ready;

    document.documentElement.animate(
      {
        clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRadius}px at ${x}px ${y}px)`],
      },
      {
        duration: 500,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)',
      }
    );
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
    >
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
