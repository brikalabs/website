'use client';

import { cn } from '@/lib/utils';
import { C, Cyan, DIM, G, Kbd, R, Y } from './colors';
import { BORDER, CharLine, type Seg, wrapBody } from './primitives';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
export interface LogLine {
  ts: string;
  level: LogLevel;
  source: string;
  msg: string;
}

const LEVEL_COLORS: Record<LogLevel, string> = {
  ERROR: R,
  WARN: Y,
  INFO: C,
  DEBUG: DIM,
};

export const INITIAL_LOGS: LogLine[] = [
  { ts: '14:02:11', level: 'INFO', source: 'hub', msg: 'listening on :3001' },
  {
    ts: '14:02:13',
    level: 'INFO',
    source: 'plugin/spotify',
    msg: 'connecting to wss://api.spotify.com',
  },
  { ts: '14:02:14', level: 'INFO', source: 'plugin/weather', msg: "cache miss 'geneva'" },
  {
    ts: '14:02:15',
    level: 'WARN',
    source: 'plugin/spotify',
    msg: 'retrying handshake (attempt 2)',
  },
  { ts: '14:02:16', level: 'INFO', source: 'plugin/spotify', msg: 'authenticated as user 482914' },
  { ts: '14:02:17', level: 'INFO', source: 'hub', msg: 'gc cycle, freed 3.2MB' },
  {
    ts: '14:02:19',
    level: 'INFO',
    source: 'workflow',
    msg: '"morning-routine" triggered by schedule',
  },
  { ts: '14:02:19', level: 'INFO', source: 'plugin/hue', msg: 'set_color bedroom warm_2700k' },
  {
    ts: '14:02:20',
    level: 'INFO',
    source: 'workflow',
    msg: '"morning-routine" completed in 412ms',
  },
];

export const NEW_LOG_POOL: LogLine[] = [
  {
    ts: '14:02:24',
    level: 'INFO',
    source: 'plugin/spotify',
    msg: 'now_playing "Mind Heist" – Daft Punk',
  },
  { ts: '14:02:27', level: 'DEBUG', source: 'hub', msg: 'tick 4231' },
  {
    ts: '14:02:30',
    level: 'INFO',
    source: 'plugin/matter',
    msg: 'device 0x4a online · Living-Room-TV',
  },
  { ts: '14:02:33', level: 'WARN', source: 'plugin/weather', msg: 'rate-limited, backing off 30s' },
  { ts: '14:02:36', level: 'INFO', source: 'workflow', msg: '"sunset-lights" scheduled for 17:54' },
];

const SOURCE_W = 16;
// HH:MM:SS + 2sp + LEVEL(5) + 1sp + source(SOURCE_W) + 1sp = fixed prefix.
const FIXED_PREFIX = 8 + 2 + 5 + 1 + SOURCE_W + 1;

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, Math.max(0, max - 1))}…` : text;
}

function logRowSegs(line: LogLine, maxMsg: number): Seg[] {
  const source =
    line.source.length > SOURCE_W
      ? `${line.source.slice(0, SOURCE_W - 1)}…`
      : line.source.padEnd(SOURCE_W);

  return [
    { text: line.ts, className: DIM },
    { text: '  ' },
    { text: line.level.padEnd(5), className: cn('font-medium', LEVEL_COLORS[line.level]) },
    { text: ' ' },
    { text: source, className: C },
    { text: ' ' },
    { text: truncate(line.msg, maxMsg) },
  ];
}

export function LogsView({ logs, cols }: Readonly<{ logs: LogLine[]; cols: number }>) {
  const width = cols;
  const maxMsg = Math.max(0, width - 4 - FIXED_PREFIX);

  const headerSegs: Seg[] = [
    { text: 'hub', className: 'font-medium' },
    { text: ' · ', className: DIM },
    { text: '● live', className: G },
    { text: ` · ${logs.length} lines`, className: DIM },
  ];

  const topBorder: Seg[] = [{ text: `┌${'─'.repeat(width - 2)}┐`, className: BORDER }];
  const botBorder: Seg[] = [{ text: `└${'─'.repeat(width - 2)}┘`, className: BORDER }];

  return (
    <div>
      <div className="whitespace-pre font-mono leading-tight">
        <CharLine width={width} segs={topBorder} />
        <CharLine width={width} segs={wrapBody(headerSegs, width)} />
        {logs.slice(-9).map((line, i) => (
          <CharLine
            key={`${line.ts}-${i}`}
            width={width}
            segs={wrapBody(logRowSegs(line, maxMsg), width)}
          />
        ))}
        <CharLine width={width} segs={botBorder} />
      </div>
      <div className="mt-2 font-mono">
        <Cyan>▸</Cyan> <Kbd>↑</Kbd> up{'   '}
        <Kbd>↓</Kbd> down{'   '}
        <Kbd>/</Kbd> search
      </div>
    </div>
  );
}
