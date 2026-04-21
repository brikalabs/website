'use client';

import { BadgeCheck, Download, Package } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { npm } from '@/lib/config';
import type { Plugin } from '@/lib/plugins';
import { useTilt3D } from '@/lib/use-tilt-3d';
import { cn } from '@/lib/utils';

/** Card layout width: w-64 (256px) + --marquee-gap (1.25rem = 20px). */
const CARD_UNIT_PX = 276;
/** SSR default + floor. Covers ~3.3K viewports without a loop gap. */
const MIN_CARDS = 12;

/**
 * Enough cards per track half to cover the viewport. For a seamless loop,
 * N*(cardW+gap) must exceed viewport width — otherwise when the track
 * translates by -N*(cardW+gap) the viewport reveals past the duplicate set,
 * producing a visible gap (visible on ultrawide monitors).
 */
function useAdaptiveCardCount() {
  const [count, setCount] = useState(MIN_CARDS);

  useEffect(() => {
    const update = () => {
      const needed = Math.ceil(window.innerWidth / CARD_UNIT_PX) + 2;
      setCount(Math.max(MIN_CARDS, needed));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return count;
}

function formatDownloads(n: number) {
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}k`;
  }
  return String(n);
}

function repeat<T>(items: T[], min: number): T[] {
  if (items.length === 0) {
    return [];
  }
  const out: T[] = [];
  while (out.length < min) {
    out.push(...items);
  }
  return out;
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

function PluginCard({
  plugin,
  duplicate = false,
}: Readonly<{
  plugin: Plugin;
  duplicate?: boolean;
}>) {
  const t = useTranslations('Plugins');
  const { ref, onMouseEnter, onMouseMove, onMouseLeave } = useTilt3D<HTMLAnchorElement>();

  return (
    <a
      ref={ref}
      href={`${npm.packageUrl}/${plugin.name}`}
      target="_blank"
      rel="noopener noreferrer"
      className="tilt-card group corner-squircle relative flex w-64 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface p-5 will-change-transform"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div className="tilt-card-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="tilt-card-shine pointer-events-none absolute inset-0 overflow-hidden" />

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

      {/* Description */}
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
  );
}

/* ── Smooth playback rate lerp ── */
function useMarqueeHover(trackRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const track: HTMLDivElement | null = trackRef.current;
    if (!track) {
      return;
    }
    const el = track;

    let target = 1;
    let current = 1;
    let raf = 0;

    function tick() {
      current += (target - current) * 0.07;

      const anim = el.getAnimations()[0];
      if (Math.abs(current - target) < 0.005) {
        current = target;
        if (anim) {
          anim.playbackRate = current;
        }
        raf = 0;
        return;
      }

      if (anim) {
        anim.playbackRate = current;
      }
      raf = requestAnimationFrame(tick);
    }

    function startLerp() {
      if (!raf) {
        raf = requestAnimationFrame(tick);
      }
    }

    const row = track.parentElement;
    const enter = () => {
      target = 0;
      startLerp();
    };
    const leave = () => {
      target = 1;
      startLerp();
    };

    row?.addEventListener('mouseenter', enter);
    row?.addEventListener('mouseleave', leave);

    return () => {
      if (raf) {
        cancelAnimationFrame(raf);
      }
      row?.removeEventListener('mouseenter', enter);
      row?.removeEventListener('mouseleave', leave);
    };
  }, [trackRef]);
}

/* ── Marquee row ── */
function MarqueeRow({
  plugins,
  reverse = false,
  duration = 40,
}: Readonly<{
  plugins: Plugin[];
  reverse?: boolean;
  duration?: number;
}>) {
  const minCards = useAdaptiveCardCount();
  const cards = padTo(plugins, minCards);

  return (
    <div
      className="marquee-row"
      style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
    >
      <div className={cn('marquee-track', reverse && 'marquee-reverse')}>
        <div className="marquee-set">
          {cards.map((plugin, i) => (
            <PluginCard key={`a-${plugin.name}-${i}`} plugin={plugin} />
          ))}
        </div>
        {/* Duplicate is aria-hidden (screen readers skip it) but NOT inert —
            inert would block pointer events, so hovered duplicates wouldn't
            tilt. Cards use tabIndex={-1} to stay out of tab order. */}
        <div className="marquee-set" aria-hidden="true">
          {cards.map((plugin, i) => (
            <PluginCard key={`b-${plugin.name}-${i}`} plugin={plugin} duplicate />
          ))}
        </div>
      </div>
    </div>
  );
}

export function PluginGrid({
  plugins,
}: Readonly<{
  plugins: Plugin[];
}>) {
  return (
    <div className="marquee-container">
      <MarqueeRow plugins={plugins} duration={80} />
      <MarqueeRow plugins={[...plugins].reverse()} reverse duration={100} />
    </div>
  );
}
