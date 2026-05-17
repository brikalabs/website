'use client';

import { useBlinkingFace, useTypewriter } from './hooks';

const BUBBLE_MESSAGES = [
  'hub is humming along.',
  '4 plugins · all ready.',
  'watching 2 workflows.',
  'uptime: 3d 14h 27m.',
  'no errors in the last hour.',
  '147 events handled today.',
];

/** "╭───╮  " mascot block + "◀─" tail = 9 chars to the left of the bubble. */
const MASCOT_TAIL_WIDTH = 9;

const LONGEST_MESSAGE = BUBBLE_MESSAGES.reduce((m, s) => Math.max(m, s.length), 0);

/**
 * Brix mascot + speech bubble — rendered as one <pre> so monospace columns
 * line up across mascot, tail, and bubble. The real TUI uses a 3-row
 * procedural brick with face row (FACE_HAPPY = `^◡^`) and a bubble with a
 * left-pointing tail `◀─┤`.
 *
 * Bubble width is fixed (longest message + padding) so it doesn't reflow
 * as the typewriter types — clamped to available cols.
 */
export function BrixHeader({ cols }: Readonly<{ cols: number }>) {
  const face = useBlinkingFace();
  const { text, blinking } = useTypewriter(BUBBLE_MESSAGES);

  const maxBubbleWidth = Math.max(20, cols - MASCOT_TAIL_WIDTH);
  const bw = Math.min(maxBubbleWidth, LONGEST_MESSAGE + 6);

  const cursor = blinking ? '▏' : '';
  const inner = bw - 2;
  const used = 1 + text.length + cursor.length; // " " + text + cursor
  const pad = ' '.repeat(Math.max(0, inner - used));
  const dashes = '─'.repeat(bw - 2);

  const top = `╭───╮  ╭${dashes}╮`;
  const mid = `│${face}│◀─┤ ${text}${cursor}${pad}│`;
  const bot = `╰───╯  ╰${dashes}╯`;

  return <pre className="font-mono leading-tight">{`${top}\n${mid}\n${bot}`}</pre>;
}
