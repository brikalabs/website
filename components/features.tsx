'use client';

import { Blocks, Cable, LayoutDashboard, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTilt3D } from '@/lib/use-tilt-3d';
import { cn } from '@/lib/utils';
import { useOnceVisible } from './ui/animated-section';

interface Feature {
  icon: LucideIcon;
  key: 'reactiveBlocks' | 'isolatedPlugins' | 'visualEditor';
  color: string;
}

const features: Feature[] = [
  {
    icon: Blocks,
    key: 'reactiveBlocks',
    color: 'oklch(0.72 0.15 145)',
  },
  {
    icon: Cable,
    key: 'isolatedPlugins',
    color: 'oklch(0.7 0.16 265)',
  },
  {
    icon: LayoutDashboard,
    key: 'visualEditor',
    color: 'oklch(0.72 0.18 45)',
  },
];

function FeatureCard({
  feature,
  visible,
  index,
}: Readonly<{
  feature: Feature;
  visible: boolean;
  index: number;
}>) {
  const t = useTranslations('Features');
  const { ref, onMouseMove, onMouseLeave } = useTilt3D(8);

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn(
        'tilt-card feature-card group corner-squircle relative overflow-hidden rounded-2xl border border-border bg-surface p-6 will-change-transform',
        visible ? 'animate-[card-enter_0.5s_ease-out_backwards]' : 'opacity-0'
      )}
      style={
        visible
          ? ({
              animationDelay: `${250 + index * 120}ms`,
              '--card-color': feature.color,
            } as React.CSSProperties)
          : undefined
      }
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {/* Cursor-following glow */}
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

      {/* Subtle gradient accent blob on hover */}
      <div
        className="pointer-events-none absolute -top-12 -right-12 size-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-10"
        style={{
          background: feature.color,
        }}
      />

      <div
        className="corner-squircle relative mb-4 inline-flex size-12 items-center justify-center rounded-xl"
        style={{
          backgroundColor: `color-mix(in oklch, ${feature.color}, transparent 88%)`,
        }}
      >
        <feature.icon
          className="size-6"
          style={{
            color: feature.color,
          }}
        />
      </div>
      <h3 className="relative mb-1.5 font-semibold text-lg">{t(`${feature.key}.title`)}</h3>
      <p className="relative text-muted-foreground text-sm leading-relaxed">
        {t(`${feature.key}.description`)}
      </p>
      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {t.raw(`${feature.key}.tags`).map((tag: string) => (
          <span
            key={tag}
            className="rounded-full bg-muted px-2.5 py-0.5 font-medium text-[10px] text-muted-foreground transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Features() {
  const t = useTranslations('Features');
  const { ref, visible } = useOnceVisible();

  return (
    <section ref={ref} id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <h2
          className={cn(
            'mb-2 text-center font-bold text-3xl tracking-tight md:text-4xl',
            'transition-[opacity,transform] duration-700 ease-out',
            visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          )}
        >
          {t('heading')}
        </h2>
        <p
          className={cn(
            'mb-12 text-center text-muted-foreground',
            'transition-[opacity,transform] duration-700 ease-out',
            visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          )}
          style={{
            transitionDelay: visible ? '100ms' : '0ms',
          }}
        >
          {t('subheading')}
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <FeatureCard key={f.key} feature={f} visible={visible} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
