import { cn } from '@/lib/utils';

export function Chip({
  label,
  className,
  delay,
  depth,
  dot,
  phase,
}: Readonly<{
  label: string;
  className?: string;
  delay: number;
  depth: number;
  dot: [number, number, number];
  phase: number;
}>) {
  const isDistant = depth < 0.65;
  const dotColor = `oklch(${dot[0]} ${dot[1]} ${dot[2]})`;

  return (
    <span
      className={cn(
        'clay-chip absolute inline-flex select-none items-center gap-1.5 rounded-full border border-border bg-background/85 px-2.5 py-1 text-[10px] text-foreground shadow-sm backdrop-blur-sm',
        isDistant ? 'clay-chip-distant font-normal' : 'font-medium',
        className
      )}
      style={
        {
          '--chip-scale': depth,
          '--chip-opacity': 0.55 + depth * 0.45,
          '--chip-delay': `${delay}ms`,
          '--chip-phase': `${phase}s`,
          '--chip-dot': dotColor,
          // Depth-based stacking: deep (small) chips sit behind the tiles
          // (z=10), close chips sit in front. 0..20 range maps cleanly.
          zIndex: Math.round(depth * 20),
        } as React.CSSProperties
      }
    >
      <span
        aria-hidden
        className="size-1.5 rounded-full"
        style={{
          background: dotColor,
          boxShadow: `0 0 6px ${dotColor}`,
        }}
      />
      {label}
    </span>
  );
}
