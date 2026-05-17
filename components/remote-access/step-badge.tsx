import { CYCLE } from './animation';

/**
 * A pill-shaped step badge centred at (x, y). Opacity is driven by SMIL
 * keyTimes so the same component can render either phase indicator.
 */
export function StepBadge({
  x,
  y,
  color,
  label,
  keyTimes,
  opacityValues,
}: Readonly<{
  x: number;
  y: number;
  color: string;
  label: string;
  keyTimes: string;
  opacityValues: string;
}>) {
  // Width tuned for both English and French labels; the longest currently
  // is "2. Direct WebRTC channel" / "2. Canal WebRTC direct".
  const width = 170;
  const height = 20;

  return (
    <g opacity="0">
      <animate
        attributeName="opacity"
        values={opacityValues}
        keyTimes={keyTimes}
        dur={CYCLE}
        repeatCount="indefinite"
      />
      <rect
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        rx={height / 2}
        fill={color}
        fillOpacity="0.12"
        stroke={color}
        strokeOpacity="0.6"
        strokeWidth="1"
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        className="font-sans"
        fontSize="11"
        fontWeight="600"
        fill={color}
      >
        {label}
      </text>
    </g>
  );
}
