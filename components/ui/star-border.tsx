import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StarBorderProps {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** Color of the orbiting "stars" gradient. */
  color?: string;
  /** Orbit duration, e.g. "6s". */
  speed?: string;
  /** Border padding thickness in px. */
  thickness?: number;
  style?: CSSProperties;
}

/**
 * Themed StarBorder — two radial-gradient halos orbit the border perimeter.
 *
 * Wrap any clickable/interactive element; this is a decorative shell, not a
 * button itself. The inner div carries the actual background — pass
 * `innerClassName` to restyle.
 *
 * Requires `--animate-star-movement-top/bottom` registered in globals.css.
 */
export function StarBorder({
  children,
  className,
  innerClassName,
  color = 'var(--primary)',
  speed = '5s',
  thickness = 1,
  style,
}: Readonly<StarBorderProps>) {
  return (
    <span
      className={cn('relative inline-flex overflow-hidden rounded-full', className)}
      style={{ padding: `${thickness}px 0`, ...style }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-[250%] -bottom-[11px] z-0 h-1/2 w-[300%] animate-star-movement-bottom rounded-full opacity-70"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-[10px] -left-[250%] z-0 h-1/2 w-[300%] animate-star-movement-top rounded-full opacity-70"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <span className={cn('relative z-10 inline-flex rounded-full', innerClassName)}>
        {children}
      </span>
    </span>
  );
}
