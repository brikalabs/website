'use client';

import { cn } from '@/lib/utils';
import { B, C, Cyan, DIM, Dim, Green, Kbd, Yellow } from './colors';

export function PluginsView() {
  return (
    <div className="font-mono">
      <div className="mb-1">
        <B>Plugins</B>
      </div>
      <div className="mb-1 flex gap-3">
        <div>
          <div className={cn('font-bold', C)}>Installed</div>
          <div className={C}>━━━━━━━━━</div>
        </div>
        <div>
          <Dim>Search</Dim>
          <div className={DIM}>──────</div>
        </div>
      </div>
      <div className="mb-2">
        <Dim>12 installed</Dim>
      </div>
      <div>
        <Cyan>
          <B>▸</B>
        </Cyan>{' '}
        <B>Spotify Plugin</B> <Dim>v1.2.0</Dim> <Green>running</Green>
      </div>
      <div>
        {'  '}Slack Notifier <Dim>v0.3.1</Dim> <Dim>stopped</Dim>
      </div>
      <div>
        {'  '}weather <Dim>v0.0.4</Dim> <Yellow>installing</Yellow>
      </div>
      <div>
        {'  '}philips-hue <Dim>v1.0.2</Dim> <Green>running</Green>
      </div>
      <div>
        {'  '}matter-bridge <Dim>v2.1.0</Dim> <Yellow>restarting</Yellow>
      </div>
      <div className="mt-1">
        <Dim>↑ ↓ 1-5/12</Dim>
      </div>
      <div className="mt-2">
        <Cyan>▸</Cyan> <Kbd>/</Kbd> filter{'   '}
        <Kbd>→</Kbd> search
      </div>
    </div>
  );
}
