'use client';

import { BadgeCheck, Download, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { npm } from '@/lib/config';
import type { Plugin } from '@/lib/plugins';
import { BorderGlow } from './ui/border-glow';
import { LogoLoop } from './ui/logo-loop';

/** Horizontal gap between cards (also between adjacent loop copies). */
const CARD_GAP_PX = 20;

function formatDownloads(n: number) {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}k`;
  }
  return String(n);
}

function PluginIcon({
  src,
  name,
}: Readonly<{
  src: string;
  name: string;
}>) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="corner-squircle flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
        <Package className="size-7 text-primary" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      width={56}
      height={56}
      className="corner-squircle size-14 shrink-0 rounded-2xl bg-muted/50 object-cover"
      onError={() => setFailed(true)}
    />
  );
}

function PluginCard({ plugin }: Readonly<{ plugin: Plugin }>) {
  const t = useTranslations('Plugins');

  return (
    <BorderGlow
      tilt
      tiltIntensity={16}
      colorGlow
      idleOpacity={0.2}
      borderRadius={16}
      glowRadius={24}
      edgeSensitivity={40}
      glowColor="260 70 70"
      glowIntensity={0.9}
      coneSpread={26}
      className="plugin-tilt corner-squircle h-48 w-64 shrink-0"
      innerClassName="corner-squircle overflow-hidden"
    >
      <a
        href={`${npm.packageUrl}/${plugin.name}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-full w-full flex-col p-5"
      >
        <div className="relative flex items-center gap-3">
          <PluginIcon src={plugin.iconUrl} name={plugin.name} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-semibold text-sm">{plugin.displayName}</h3>
              {plugin.verified && (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary/10">
                  <BadgeCheck className="size-3.5 text-primary" />
                </span>
              )}
            </div>
            <span className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground/50">
              {plugin.name}
            </span>
          </div>
        </div>

        <p className="relative mt-3 line-clamp-2 text-muted-foreground text-xs leading-relaxed">
          {plugin.description}
        </p>

        <div className="relative mt-auto pt-3">
          <div className="mb-3 h-px bg-border/60" />
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground/70">
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium">v{plugin.version}</span>
            {plugin.downloads > 0 && (
              <span className="flex items-center gap-1">
                <Download className="size-3" />
                {t('perWeek', { count: formatDownloads(plugin.downloads) })}
              </span>
            )}
          </div>
        </div>
      </a>
    </BorderGlow>
  );
}

/**
 * Map plugins → LogoLoop items. The `node` carries the rendered card so
 * LogoLoop's measurement / RAF-driven scroll handles sizing and seamless
 * wrap for us; we no longer need to estimate copy counts from a hard-coded
 * card width.
 */
function toItems(plugins: Plugin[]) {
  return plugins.map((plugin) => ({
    node: <PluginCard plugin={plugin} />,
  }));
}

function PluginRow({
  plugins,
  direction,
  speed,
}: Readonly<{
  plugins: Plugin[];
  direction: 'left' | 'right';
  speed: number;
}>) {
  return (
    <LogoLoop
      logos={toItems(plugins)}
      direction={direction}
      speed={speed}
      /* Decelerate on hover instead of a hard pause. Per-card tilt still
         works because the row's effective velocity decays smoothly via
         LogoLoop's velocity-easing loop. */
      hoverSpeed={20}
      gap={CARD_GAP_PX}
      logoHeight={1}
      renderItem={(item) => (item as { node: React.ReactNode }).node}
      fadeOut
      fadeOutColor="var(--background)"
      ariaLabel="Brika plugins"
    />
  );
}

export function PluginGrid({
  plugins,
}: Readonly<{
  plugins: Plugin[];
}>) {
  return (
    <div className="flex flex-col gap-4 py-6">
      <PluginRow plugins={plugins} direction="left" speed={45} />
      <PluginRow plugins={[...plugins].reverse()} direction="right" speed={35} />
    </div>
  );
}
