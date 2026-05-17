import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface GradientFlowTextProps {
  text: string;
  className?: string;
  /** Cycle duration in seconds. */
  speed?: number;
  /** Optional inline style override. */
  style?: CSSProperties;
}

/**
 * Multi-stop gradient text that slowly flows colors across itself.
 *
 * More premium and less harsh than the reactbits ShinyText shimmer — no white
 * highlight sweep, just hues drifting through the letterforms. Pure CSS; pair
 * with `.gradient-flow-text` keyframes in globals.css.
 */
export function GradientFlowText({
  text,
  className,
  speed = 9,
  style,
}: Readonly<GradientFlowTextProps>) {
  return (
    <span
      className={cn('gradient-flow-text inline-block', className)}
      style={{ animationDuration: `${speed}s`, ...style }}
    >
      {text}
    </span>
  );
}
