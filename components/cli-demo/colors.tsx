import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Ink color palette ported to Tailwind arbitrary OKLCH classes — same values
 * work in both light and dark themes. Use the raw class strings (G, Y, R, C)
 * when composing into `cn(...)`; use the wrapper components for plain JSX.
 */
export const G = 'text-[oklch(0.7_0.16_150)]';
export const Y = 'text-[oklch(0.78_0.16_80)]';
export const R = 'text-[oklch(0.66_0.22_25)]';
export const C = 'text-[oklch(0.74_0.14_215)]';
export const DIM = 'text-muted-foreground';

export function Green({ children }: Readonly<{ children: ReactNode }>) {
  return <span className={G}>{children}</span>;
}
export function Yellow({ children }: Readonly<{ children: ReactNode }>) {
  return <span className={Y}>{children}</span>;
}
export function Red({ children }: Readonly<{ children: ReactNode }>) {
  return <span className={R}>{children}</span>;
}
export function Cyan({ children }: Readonly<{ children: ReactNode }>) {
  return <span className={C}>{children}</span>;
}
export function Dim({ children }: Readonly<{ children: ReactNode }>) {
  return <span className={DIM}>{children}</span>;
}
export function B({ children }: Readonly<{ children: ReactNode }>) {
  // font-medium not font-bold — bold widens char cells in many monospace
  // fonts and breaks column alignment with surrounding regular text.
  return <span className="font-medium">{children}</span>;
}

/** Keyboard chip — matches the TUI's <Kbd> primitive: dim brackets, bold key. */
export function Kbd({ children, tone = Y }: Readonly<{ children: ReactNode; tone?: string }>) {
  return (
    <span>
      <Dim>[</Dim>
      <span className={cn('font-medium', tone)}>{children}</span>
      <Dim>]</Dim>
    </span>
  );
}
