'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const LOCALES: readonly Locale[] = ['en', 'fr'] as const;

export function LocaleToggle() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('LocaleToggle');

  const switchTo = (next: Locale) => {
    if (next === locale) return;
    router.replace(pathname, { locale: next });
  };

  const ariaFor = (l: Locale) =>
    l === 'fr' ? t('switchToFrench') : t('switchToEnglish');

  return (
    <div className="flex items-center rounded-full border border-border bg-surface/50 p-0.5">
      {LOCALES.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            onClick={() => switchTo(l)}
            aria-label={ariaFor(l)}
            aria-pressed={active}
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer',
              active
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
