'use client';

import { useTranslations } from 'next-intl';
import { Chip } from './chip';
import { CHIPS } from './chips-data';

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
          for staggered entry; --tile-i drives the ongoing breathe phase. */}
      <div className="absolute inset-0 z-10">
        <div
          className="clay-tile absolute top-[22%] bottom-[22%] left-[24%] w-[18.7%]"
          style={{ '--i': 0 } as React.CSSProperties}
        />
        <div
          className="clay-tile absolute top-[22%] left-[48.7%] h-[25%] w-[27.3%]"
          style={{ '--i': 1 } as React.CSSProperties}
        />
        <div
          className="clay-tile absolute bottom-[22%] left-[48.7%] h-[25%] w-[27.3%]"
          style={{ '--i': 2 } as React.CSSProperties}
        />
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
