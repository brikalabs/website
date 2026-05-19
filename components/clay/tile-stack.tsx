'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { BorderGlow } from '../ui/border-glow';
import { Chip } from './chip';
import { CHIPS } from './chips-data';

const CLAY_TILE_MESH = ['#f4b878', '#e8c896', '#c299ff'] as const;
const CLAY_TILES = [
  { key: 'left', i: 0, pos: 'top-[22%] bottom-[22%] left-[24%] w-[18.7%]' },
  { key: 'top', i: 1, pos: 'top-[22%] left-[48.7%] h-[25%] w-[27.3%]' },
  { key: 'bottom', i: 2, pos: 'bottom-[22%] left-[48.7%] h-[25%] w-[27.3%]' },
] as const;

/**
 * Decorative tile composition that mirrors the Clay brand mark
 * (1 vertical bar + 2 stacked squares), surrounded by a galaxy of
 * component chips. Each tile sits on its own translateZ layer for
 * a tactile parallax under the parent tilt transform.
 */
export function ClayTileStack() {
  const t = useTranslations('Clay');

  return (
    <div className="clay-stack relative aspect-square w-full max-w-[360px]">
      {/* Backlight stack — three layers compose a cinematic glow:
          (1) slow-rotating conic rays for subtle directional light,
          (2) warm bloom that pulses gently behind the cluster,
          (3) bright key core directly behind the tiles. All sit at -z-10
          so chips and tiles paint above. */}
      <div className="clay-backlight-rays pointer-events-none absolute inset-[-22%] -z-10" />
      <div className="clay-backlight-bloom pointer-events-none absolute inset-[-12%] -z-10" />
      <div className="clay-backlight-core pointer-events-none absolute inset-[10%] -z-10" />

      {/* Tile cluster — exact Clay brand-mark percentages from the SVG viewBox.
          z-10 layer so chips with depth >= 0.5 stack above and deep halo chips
          (depth < 0.5) sit behind for a galaxy feel. Each tile carries --i
          for staggered entry; --tile-i drives the ongoing breathe phase.

          BorderGlow is configured lean for perf: halo=false skips the
          mix-blend-mode outer-glow layer, no colorGlow keeps the cursor-
          following radial gradient off. The .clay-tile inside already
          carries the warm ambient box-shadow. */}
      <div className="absolute inset-0 z-10">
        {CLAY_TILES.map((tile) => (
          <BorderGlow
            key={tile.key}
            halo={false}
            idleOpacity={0.35}
            borderRadius={14}
            edgeSensitivity={30}
            glowColor="40 80 70"
            glowIntensity={1}
            coneSpread={28}
            colors={CLAY_TILE_MESH}
            backgroundColor="transparent"
            className={cn('absolute', tile.pos)}
            innerClassName="clay-tile h-full w-full"
            style={{ '--i': tile.i } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Galaxy of floating component chips */}
      {CHIPS.map((chip, i) => (
        <Chip
          key={chip.key}
          label={t(`chips.${chip.key}`)}
          className={chip.pos}
          delay={80 + i * 70}
          depth={chip.depth}
          dot={chip.dot}
          phase={chip.phase}
        />
      ))}
    </div>
  );
}
