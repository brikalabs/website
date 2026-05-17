import { DIM } from './colors';

/** A styled string segment — base building block for char-aligned rendering. */
export type Seg = { text: string; className?: string };

export const BORDER = DIM;

function segLen(segs: Seg[]): number {
  return segs.reduce((n, s) => n + s.text.length, 0);
}

/**
 * Char-aligned line: renders segments inside a `whitespace-pre font-mono`
 * parent and pads with trailing spaces to a fixed char width. Without exact
 * char counting, colored spans push the right-side borders around.
 */
export function CharLine({ width, segs }: Readonly<{ width: number; segs: Seg[] }>) {
  const pad = Math.max(0, width - segLen(segs));
  return (
    <div>
      {segs.map((s, i) => (
        // Segments are positional pieces of one character-aligned line and
        // have no stable identity; the index is the correct key here.
        <span key={`${i}-${s.text}`} className={s.className}>
          {s.text}
        </span>
      ))}
      {pad > 0 && ' '.repeat(pad)}
    </div>
  );
}

/**
 * Wrap a content row with left "│ " and right " │" borders, padding between
 * content and the right border so panes stay column-aligned regardless of
 * content length.
 */
export function wrapBody(segs: Seg[], width: number): Seg[] {
  const inner = width - 4; // 2 left ("│ ") + 2 right (" │")
  const pad = Math.max(0, inner - segLen(segs));
  return [
    { text: '│ ', className: BORDER },
    ...segs,
    { text: ' '.repeat(pad) },
    { text: ' │', className: BORDER },
  ];
}

/** Sectioning divider — single dim ── across the full terminal width. */
export function Divider({ cols }: Readonly<{ cols: number }>) {
  return <div className={DIM}>{'─'.repeat(cols)}</div>;
}

/**
 * Round-bordered Pane (matches the TUI's <Pane borderStyle="round">). Title
 * and right-slot badge render inline in the top border; the dash fill auto-
 * sizes to keep the closing `╮` at exactly column `width`.
 */
export function Pane({
  title,
  icon,
  iconClass,
  right,
  width,
  rows,
  footer,
}: Readonly<{
  title: string;
  icon?: string;
  iconClass?: string;
  right?: Seg;
  width: number;
  rows: Seg[][];
  footer?: Seg[];
}>) {
  // Top row chars (each segment counted precisely):
  //   "╭─"            = 2
  //   " <icon>"       = 1 + icon.length        (if icon)
  //   " <title> "     = title.length + 2
  //   "<dashes>"      = computed
  //   " <right>"      = 1 + right.text.length  (if right)
  //   "╮"             = 1
  const iconBlock = icon ? 1 + icon.length : 0;
  const titleBlock = title.length + 2;
  const rightBlock = right ? 1 + right.text.length : 0;
  const usedNonFill = 2 + iconBlock + titleBlock + rightBlock + 1;
  const dashCount = Math.max(2, width - usedNonFill);

  // font-medium (500) instead of bold (700) — most monospace fonts keep
  // weight 100–500 at constant char width but widen at 600+. Visual contrast
  // is still there against the muted border chars around it.
  const topSegs: Seg[] = [
    { text: '╭─', className: BORDER },
    ...(icon ? [{ text: ` ${icon}`, className: iconClass }] : []),
    { text: ` ${title} `, className: 'font-medium' },
    { text: '─'.repeat(dashCount), className: BORDER },
    ...(right
      ? [
          { text: ' ', className: BORDER },
          { text: right.text, className: right.className },
        ]
      : []),
    { text: '╮', className: BORDER },
  ];

  const blankRow: Seg[] = [
    { text: '│', className: BORDER },
    { text: ' '.repeat(width - 2) },
    { text: '│', className: BORDER },
  ];

  const botSegs: Seg[] = [{ text: `╰${'─'.repeat(width - 2)}╯`, className: BORDER }];

  return (
    <div className="whitespace-pre font-mono leading-tight">
      <CharLine width={width} segs={topSegs} />
      <CharLine width={width} segs={blankRow} />
      {rows.map((row, i) => (
        // Rows are positional within a static pane and have no stable id;
        // we hash the row text into the key so re-orders remount correctly.
        <CharLine
          key={`${i}-${row.map((s) => s.text).join('')}`}
          width={width}
          segs={wrapBody(row, width)}
        />
      ))}
      {footer && (
        <>
          <CharLine width={width} segs={blankRow} />
          <CharLine width={width} segs={wrapBody(footer, width)} />
        </>
      )}
      <CharLine width={width} segs={botSegs} />
    </div>
  );
}
