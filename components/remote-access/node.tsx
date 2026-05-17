import { CYCLE } from './animation';

type GlyphIcon = 'browser' | 'cloud' | 'hub';

/**
 * Hand-drawn SVG glyphs. Lucide icons don't compose cleanly inside an
 * arbitrary viewBox without nested <svg>, and we want predictable
 * alignment with the surrounding circles.
 */
function NodeGlyph({
  x,
  y,
  icon,
  color,
}: Readonly<{
  x: number;
  y: number;
  icon: GlyphIcon;
  color: string;
}>) {
  if (icon === 'browser') {
    return (
      <g stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round">
        <rect x={x - 8} y={y - 6} width="16" height="12" rx="2" />
        <line x1={x - 8} y1={y - 2} x2={x + 8} y2={y - 2} />
        <circle cx={x - 5} cy={y - 4} r="0.6" fill={color} />
        <circle cx={x - 3} cy={y - 4} r="0.6" fill={color} />
      </g>
    );
  }
  if (icon === 'cloud') {
    return (
      <g
        stroke={color}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={`translate(${x - 9}, ${y - 6})`}
      >
        <path d="M 4 11 a 3.5 3.5 0 0 1 0.5 -7 a 4.5 4.5 0 0 1 9 0.5 a 3 3 0 0 1 -1 6 z" />
      </g>
    );
  }
  // hub — two stacked server-rack rows
  return (
    <g stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round">
      <rect x={x - 8} y={y - 6} width="16" height="5" rx="1" />
      <rect x={x - 8} y={y + 1} width="16" height="5" rx="1" />
      <circle cx={x - 5} cy={y - 3.5} r="0.7" fill={color} />
      <circle cx={x - 5} cy={y + 3.5} r="0.7" fill={color} />
    </g>
  );
}

/**
 * A single node. If `pulseKeyTimes`/`pulseOpacityValues` are supplied, an
 * extra outer halo fades in during that node's phase to signal "I am
 * active right now".
 */
export function DiagramNode({
  x,
  y,
  color,
  icon,
  label,
  sublabel,
  pulseKeyTimes,
  pulseOpacityValues,
}: Readonly<{
  x: number;
  y: number;
  color: string;
  icon: GlyphIcon;
  label: string;
  sublabel: string;
  pulseKeyTimes?: string;
  pulseOpacityValues?: string;
}>) {
  const labelY = y + 36;
  const subY = y + 48;

  return (
    <g>
      {/* Active-phase halo — fades in only during this node's phase. */}
      {pulseKeyTimes && pulseOpacityValues && (
        <circle cx={x} cy={y} r="26" fill={color} fillOpacity="0.18" opacity="0">
          <animate
            attributeName="opacity"
            values={pulseOpacityValues}
            keyTimes={pulseKeyTimes}
            dur={CYCLE}
            repeatCount="indefinite"
          />
          <animate attributeName="r" values="22;28;22" dur="2.4s" repeatCount="indefinite" />
        </circle>
      )}
      {/* Static halo — always faintly visible. */}
      <circle cx={x} cy={y} r="22" fill={color} fillOpacity="0.1" />
      {/* Disc */}
      <circle cx={x} cy={y} r="16" fill="var(--surface)" stroke={color} strokeWidth="1.5" />
      <NodeGlyph x={x} y={y} icon={icon} color={color} />

      <text
        x={x}
        y={labelY}
        textAnchor="middle"
        className="fill-foreground font-sans"
        fontSize="11"
        fontWeight="600"
      >
        {label}
      </text>
      <text
        x={x}
        y={subY}
        textAnchor="middle"
        className="fill-muted-foreground font-mono"
        fontSize="9"
      >
        {sublabel}
      </text>
    </g>
  );
}
