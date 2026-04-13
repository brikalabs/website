'use client';

import { BadgeCheck, Download, Package } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { npm } from '@/lib/config';
import type { Plugin } from '@/lib/plugins';
import { useTilt3D } from '@/lib/use-tilt-3d';
import { cn } from '@/lib/utils';

const MIN_CARDS = 10;

function formatDownloads(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function repeat<T>(items: T[], min: number): T[] {
  if (items.length === 0) return [];
  const out: T[] = [];
  while (out.length < min) out.push(...items);
  return out;
}

/** Deterministic interleave: pick from alternating ends for visual variety. */
function interleave<T>(items: T[]): T[] {
  const sorted = [...items];
  const result: T[] = [];
  let left = 0;
  let right = sorted.length - 1;
  let pickLeft = false;
  while (left <= right) {
    result.push(sorted[pickLeft ? left++ : right--]);
    pickLeft = !pickLeft;
  }
  return result;
}

/* ── Icon with fallback ── */
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
      <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl corner-squircle bg-primary/10">
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
      className="size-14 shrink-0 rounded-2xl corner-squircle bg-muted/50 object-cover"
      onError={() => setFailed(true)}
    />
  );
}

/* ── 3D tilt card ── */
function PluginCard({
  plugin,
}: Readonly<{
  plugin: Plugin;
}>) {
  const { ref, onMouseMove, onMouseLeave } = useTilt3D();

  return (
    <a
      ref={ref as React.Ref<HTMLAnchorElement>}
      href={`${npm.packageUrl}/${plugin.name}`}
      target="_blank"
      rel="noopener noreferrer"
      className="tilt-card group relative flex w-64 shrink-0 flex-col overflow-hidden rounded-2xl corner-squircle border border-border bg-surface p-5 will-change-transform"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Cursor-following glow */}
      <div className="tilt-card-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Shine sweep */}
      <div className="tilt-card-shine pointer-events-none absolute inset-0 overflow-hidden" />

      {/* Header: icon + name */}
      <div className="relative flex items-center gap-3">
        <PluginIcon src={plugin.iconUrl} name={plugin.name} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-sm font-semibold">{plugin.displayName}</h3>
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

      {/* Description */}
      <p className="relative mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
        {plugin.description}
      </p>

      {/* Separator + metadata */}
      <div className="relative mt-auto pt-3">
        <div className="mb-3 h-px bg-border/60" />
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground/70">
          <span className="rounded-full bg-muted px-2 py-0.5 font-medium">v{plugin.version}</span>
          {plugin.downloads > 0 && (
            <span className="flex items-center gap-1">
              <Download className="size-3" />
              {formatDownloads(plugin.downloads)}/wk
            </span>
          )}
        </div>
      </div>
    </a>
  );
}

/* ── Smooth playback rate lerp ── */
function useMarqueeHover(trackRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let target = 1;
    let current = 1;
    let raf = 0;

    function tick() {
      current += (target - current) * 0.07;

      const anim = track.getAnimations()[0];
      if (Math.abs(current - target) < 0.005) {
        current = target;
        if (anim) anim.playbackRate = current;
        raf = 0;
        return;
      }

      if (anim) anim.playbackRate = current;
      raf = requestAnimationFrame(tick);
    }

    function startLerp() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    const row = track.parentElement;
    const enter = () => { target = 0; startLerp(); };
    const leave = () => { target = 1; startLerp(); };

    row?.addEventListener('mouseenter', enter);
    row?.addEventListener('mouseleave', leave);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      row?.removeEventListener('mouseenter', enter);
      row?.removeEventListener('mouseleave', leave);
    };
  }, [trackRef]);
}

/* ── Marquee row ── */
function MarqueeRow({
  plugins,
  reverse = false,
  duration = 35,
}: Readonly<{
  plugins: Plugin[];
  reverse?: boolean;
  duration?: number;
}>) {
  const cards = repeat(plugins, MIN_CARDS);
  const trackRef = useRef<HTMLDivElement>(null);
  useMarqueeHover(trackRef);

  return (
    <div
      className="marquee-row"
      style={
        {
          '--marquee-duration': `${duration}s`,
        } as React.CSSProperties
      }
    >
      <div ref={trackRef} className={cn('marquee-track flex gap-5', reverse && 'marquee-reverse')}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 gap-5" aria-hidden={copy === 1}>
            {cards.map((plugin, i) => (
              <PluginCard key={`${copy}-${plugin.name}-${i}`} plugin={plugin} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Grid ── */
export function PluginGrid({
  plugins,
}: Readonly<{
  plugins: Plugin[];
}>) {
  // Both rows show all plugins in different orders to avoid
  // obvious repetition (especially visible with few plugins).
  const row2 = interleave(plugins);

  return (
    <div className="marquee-container space-y-4">
      <MarqueeRow plugins={plugins} duration={40} />
      <MarqueeRow plugins={row2} reverse duration={50} />
    </div>
  );
}
