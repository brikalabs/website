'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { useOnceVisible } from '../ui/animated-section';
import { SpotlightCards } from '../ui/spotlight-card';
import { FeatureCard } from './feature-card';
import { FEATURES } from './features-data';

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

        <SpotlightCards className="grid gap-6 md:grid-cols-3" glowColor="120, 90, 255" radius={340}>
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.key} feature={f} visible={visible} index={i} />
          ))}
        </SpotlightCards>
      </div>
    </section>
  );
}
