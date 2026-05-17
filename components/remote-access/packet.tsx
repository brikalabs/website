import { CYCLE } from './animation';

/**
 * A single SMIL `animateMotion` packet that:
 *   - starts invisible
 *   - becomes visible at `start` (fraction of cycle)
 *   - traverses its referenced path from `start` → `end`
 *   - disappears after `end`
 *   - idles invisibly until the cycle restarts
 *
 * Two animations driven by the same cycle: opacity (visibility) and the
 * motion itself (movement). Both share the same keyTimes, so visibility
 * and position stay aligned across the cycle.
 */
export function Packet({
  pathId,
  color,
  start,
  end,
  reverse = false,
}: Readonly<{
  pathId: string;
  color: string;
  start: number;
  end: number;
  reverse?: boolean;
}>) {
  // Movement keyTimes: stay parked at start position, then move during
  // [start, end], then stay parked at end position.
  const keyTimes = `0; ${start}; ${end}; 1`;
  const keyPoints = reverse ? '1; 1; 0; 0' : '0; 0; 1; 1';
  // Opacity keyTimes: invisible, fade in at start, fade out at end.
  const fade = 0.04;
  const visStart = Math.max(0, start - fade);
  const visEnd = Math.min(1, end + fade);
  const opacityKT = `0; ${visStart}; ${start}; ${end}; ${visEnd}; 1`;
  const opacityVals = '0; 0; 1; 1; 0; 0';

  return (
    <circle r="3.8" fill={color} opacity="0">
      <animate
        attributeName="opacity"
        values={opacityVals}
        keyTimes={opacityKT}
        dur={CYCLE}
        repeatCount="indefinite"
      />
      <animateMotion
        dur={CYCLE}
        repeatCount="indefinite"
        keyTimes={keyTimes}
        keyPoints={keyPoints}
        calcMode="linear"
      >
        <mpath href={`#${pathId}`} />
      </animateMotion>
    </circle>
  );
}
