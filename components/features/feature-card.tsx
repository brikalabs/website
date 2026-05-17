'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTilt3D } from '@/lib/use-tilt-3d';
import { cn } from '@/lib/utils';
import { useParticleBurst } from '../ui/particle-burst';
import type { Feature } from './features-data';

export function FeatureCard({
  feature,
  visible,
  index,
}: Readonly<{
  feature: Feature;
  visible: boolean;
  index: number;
}>) {
  const t = useTranslations('Features');
  const tiltRef = useTilt3D<HTMLDivElement>(8);
  const particleRef = useParticleBurst<HTMLDivElement>({
    color: feature.rgb,
    count: feature.hero ? 10 : 6,
    size: 3,
    spread: feature.hero ? 110 : 80,
    duration: 1800,
  });

  const Icon = feature.icon;

  return (
    <div
      ref={(el) => {
        tiltRef.current = el;
        particleRef.current = el;
      }}
      data-spotlight-card
      className={cn(
        'spotlight-card tilt-card feature-card group corner-squircle relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 will-change-transform',
        feature.hero && 'md:col-span-2 md:p-8',
        visible ? 'animate-[card-enter_0.5s_ease-out_backwards]' : 'opacity-0'
      )}
      style={
        visible
          ? ({
              animationDelay: `${250 + index * 120}ms`,
              '--card-color': feature.color,
              '--spotlight-glow': feature.rgb,
            } as React.CSSProperties)
          : undefined
      }
    >
      {/* Cursor-following inner glow */}
      <div
        className="tilt-card-glow pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={
          {
            '--card-accent': `color-mix(in oklch, ${feature.color} 15%, transparent)`,
          } as React.CSSProperties
        }
      />

      {/* Shine sweep */}
      <div className="tilt-card-shine pointer-events-none absolute inset-0 overflow-hidden" />

      {/* Decorative blob */}
      <div
        className={cn(
          'pointer-events-none absolute rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-15',
          feature.hero ? '-top-20 -right-20 size-64' : '-top-12 -right-12 size-32'
        )}
        style={{
          background: feature.color,
        }}
      />

      <div
        className={cn(
          'corner-squircle relative z-10 mb-4 inline-flex items-center justify-center rounded-xl',
          feature.hero ? 'size-14' : 'size-12'
        )}
        style={{
          backgroundColor: `color-mix(in oklch, ${feature.color}, transparent 88%)`,
        }}
      >
        <Icon
          className={feature.hero ? 'size-7' : 'size-6'}
          style={{
            color: feature.color,
          }}
        />
      </div>

      <h3
        className={cn('relative z-10 mb-1.5 font-semibold', feature.hero ? 'text-2xl' : 'text-lg')}
      >
        {t(`${feature.key}.title`)}
      </h3>
      <p
        className={cn(
          'relative z-10 text-muted-foreground leading-relaxed',
          feature.hero ? 'text-base md:max-w-xl' : 'text-sm'
        )}
      >
        {t(`${feature.key}.description`)}
      </p>
      <div className="relative z-10 mt-4 flex flex-wrap gap-1.5">
        {t.raw(`${feature.key}.tags`).map((tag: string) => (
          <span
            key={tag}
            className="rounded-full bg-muted px-2.5 py-0.5 font-medium text-[10px] text-muted-foreground transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
          >
            {tag}
          </span>
        ))}
      </div>

      {feature.href && (
        <div className="relative z-10 mt-auto pt-5">
          <a
            href={feature.href}
            className="group/cta inline-flex items-center gap-1.5 rounded-full border border-[var(--cta-border)] bg-[var(--cta-bg)] px-3.5 py-1.5 font-medium text-sm transition-[background-color,border-color] duration-200 hover:border-[var(--cta-border-hover)] hover:bg-[var(--cta-bg-hover)]"
            style={
              {
                color: feature.color,
                '--cta-bg': `color-mix(in oklch, ${feature.color}, transparent 92%)`,
                '--cta-bg-hover': `color-mix(in oklch, ${feature.color}, transparent 80%)`,
                '--cta-border': `color-mix(in oklch, ${feature.color}, transparent 75%)`,
                '--cta-border-hover': `color-mix(in oklch, ${feature.color}, transparent 55%)`,
              } as React.CSSProperties
            }
          >
            {t(`${feature.key}.cta`)}
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
          </a>
        </div>
      )}
    </div>
  );
}
