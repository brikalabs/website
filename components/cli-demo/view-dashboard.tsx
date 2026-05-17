'use client';

import { cn } from '@/lib/utils';
import { DIM, G, Y } from './colors';
import { Pane, type Seg } from './primitives';

const HUB_ROWS: Seg[][] = [
  [{ text: 'pid 17234' }],
  [{ text: '~/projects/home', className: DIM }],
  [{ text: '' }],
];
const HUB_FOOTER: Seg[] = [
  { text: '[', className: DIM },
  { text: '^X', className: cn('font-medium', Y) },
  { text: '] stop  ', className: DIM },
  { text: '[', className: DIM },
  { text: '^R', className: cn('font-medium', Y) },
  { text: '] restart', className: DIM },
];

const PLUGIN_ROWS: Seg[][] = [
  [{ text: '▸ ', className: G }, { text: 'Spotify' }, { text: '       v1.2.0', className: DIM }],
  [{ text: '▸ ', className: G }, { text: 'Slack Notifier' }, { text: ' v0.3.1', className: DIM }],
  [
    { text: '· weather', className: DIM },
    { text: '       v0.0.4', className: DIM },
  ],
  [
    { text: '· philips-hue', className: DIM },
    { text: '   v1.0.2', className: DIM },
  ],
];
const PLUGIN_FOOTER: Seg[] = [
  { text: '[', className: DIM },
  { text: '2', className: cn('font-medium', Y) },
  { text: '] to manage', className: DIM },
];

const WORKFLOW_ROWS: Seg[][] = [
  [{ text: '▸ ', className: Y }, { text: 'nightly-deploy' }, { text: '  idle', className: DIM }],
  [{ text: '▸ ', className: Y }, { text: 'morning-routine' }, { text: ' idle', className: DIM }],
  [{ text: '' }],
  [{ text: '' }],
];
const WORKFLOW_FOOTER: Seg[] = [
  { text: '[', className: DIM },
  { text: '3', className: cn('font-medium', Y) },
  { text: '] to manage', className: DIM },
];

// Minimum tile width to fit the widest body row without overflowing the
// border — the Hub footer "[^X] stop  [^R] restart" is 23 chars + 4 chars
// for "│ " + " │" = 27 chars.
const MIN_TILE_WIDTH = 27;
const TILE_GAP = 1; // matches gap-[1ch]

export function DashboardView({ cols }: Readonly<{ cols: number }>) {
  // Stay in row layout whenever 3 tiles physically fit; only stack once the
  // computed per-tile width would drop below the minimum readable width.
  // Matches the real TUI's responsive `<Stack>` behavior but driven by
  // actual content constraints instead of an arbitrary breakpoint.
  const rowTileW = Math.floor((cols - 2 * TILE_GAP) / 3);
  const stacked = rowTileW < MIN_TILE_WIDTH;
  const w = stacked ? cols : rowTileW;

  return (
    <div className={cn('flex', stacked ? 'flex-col gap-1' : 'flex-row gap-[1ch]')}>
      <Pane
        title="Hub"
        icon="●"
        iconClass={G}
        right={{ text: '● running', className: G }}
        width={w}
        rows={HUB_ROWS}
        footer={HUB_FOOTER}
      />
      <Pane
        title="Plugins"
        icon="▣"
        iconClass="text-foreground"
        right={{ text: '4', className: DIM }}
        width={w}
        rows={PLUGIN_ROWS}
        footer={PLUGIN_FOOTER}
      />
      <Pane
        title="Workflows"
        icon="◆"
        iconClass="text-foreground"
        right={{ text: '2', className: DIM }}
        width={w}
        rows={WORKFLOW_ROWS}
        footer={WORKFLOW_FOOTER}
      />
    </div>
  );
}
