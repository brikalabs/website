'use client';

import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { BorderGlow } from '../ui/border-glow';
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
  const Icon = feature.icon;

  return (
    <BorderGlow
      tilt
      colorGlow
      particles
      idleOpacity={0.2}
      particlesColor={feature.rgb}
      particlesCount={feature.hero ? 10 : 6}
      colorGlowAccent={`color-mix(in oklch, ${feature.color} 15%, transparent)`}
      glowColor={feature.hsl}
      colors={feature.mesh}
      borderRadius={16}
      glowRadius={32}
      edgeSensitivity={35}
      className={cn(
        'spotlight-card feature-card corner-squircle',
        feature.hero && 'md:col-span-2',
        visible ? 'animate-[card-enter_0.5s_ease-out_backwards]' : 'opacity-0'
      )}
      innerClassName={cn(
        'corner-squircle relative flex h-full flex-col overflow-hidden rounded-[inherit] p-6',
        feature.hero && 'md:p-8'
      )}
      style={
        {
          ...(visible ? { animationDelay: `${250 + index * 120}ms` } : null),
          '--card-color': feature.color,
          '--spotlight-glow': feature.rgb,
        } as React.CSSProperties
      }
    >
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
    </BorderGlow>
  );
}
