'use client';

import { ArrowUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SiGithub } from 'react-icons/si';
import { clay } from '@/lib/config';
import { useTilt3D } from '@/lib/use-tilt-3d';
import { cn } from '@/lib/utils';
import { useOnceVisible } from '../ui/animated-section';
import { ClayTileStack } from './tile-stack';

const LAYERS = ['primitives', 'tokens', 'themes', 'components'] as const;

export function ClayCard() {
  const t = useTranslations('Clay');
  const { ref, visible } = useOnceVisible();
  const tiltRef = useTilt3D<HTMLDivElement>(6);

  return (
    <section
      ref={ref as React.Ref<HTMLElement>}
      className="corner-squircle relative overflow-hidden rounded-3xl border border-border bg-surface"
    >
      {/* Warm aurora — beige/amber, distinct from the cool primary/accent palette */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <div
          className="aurora-blob absolute -top-24 left-[10%] size-72"
          style={{
            background: 'oklch(0.82 0.1 80)',
            animation: 'aurora-drift-1 18s ease-in-out infinite',
          }}
        />
        <div
          className="aurora-blob absolute right-[10%] -bottom-24 size-72"
          style={{
            background: 'oklch(0.75 0.08 50)',
            animation: 'aurora-drift-2 22s ease-in-out infinite',
          }}
        />
        {/* Subtle dot grid for texture */}
        <div className="absolute inset-0 bg-grid opacity-[0.07]" />
      </div>

      <div className="relative grid items-center gap-10 px-6 py-12 md:grid-cols-[1fr_1.1fr] md:gap-12 md:px-12 md:py-14">
        {/* Visual */}
        <div
          ref={tiltRef}
          className={cn(
            'clay-stack-wrapper relative flex items-center justify-center will-change-transform',
            visible ? 'animate-[card-enter_0.6s_ease-out_backwards]' : 'opacity-0'
          )}
        >
          <ClayTileStack />
        </div>

        {/* Content */}
        <div
          className={cn(
            'relative flex flex-col',
            visible ? 'animate-[card-enter_0.7s_ease-out_backwards]' : 'opacity-0'
          )}
          style={{ animationDelay: '120ms' }}
        >
          <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 font-medium text-[11px] text-muted-foreground uppercase tracking-wider backdrop-blur-sm">
            <span
              aria-hidden
              className="size-1.5 rounded-full"
              style={{ background: 'oklch(0.7 0.12 75)' }}
            />
            {t('eyebrow')}
          </div>

          <h3 className="clay-heading font-bold text-3xl tracking-tight md:text-4xl">
            {t('heading')}
          </h3>
          <p className="mt-3 max-w-md text-muted-foreground leading-relaxed">{t('description')}</p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {LAYERS.map((layer) => (
              <span
                key={layer}
                className="rounded-full border border-border bg-background/60 px-2.5 py-0.5 font-medium text-[10px] text-muted-foreground backdrop-blur-sm"
              >
                {t(`layers.${layer}`)}
              </span>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href={clay.url}
              target="_blank"
              rel="noopener noreferrer"
              className="clay-cta inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold text-sm transition-[transform,box-shadow] duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              {t('visit')}
              <ArrowUpRight className="size-3.5" />
            </a>
            <a
              href={clay.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 font-medium text-muted-foreground text-sm transition-colors hover:text-foreground"
            >
              <SiGithub className="size-4" />
              {t('github')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
