'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

export default function LightsBrick() {
  const t = useTranslations('Bricks.lights');
  const [on, setOn] = useState(true);

  return (
    <div className="relative flex h-full flex-col justify-end overflow-hidden px-[10%] pb-[10%]">
      {on && (
        <div
          className="pointer-events-none absolute -top-[10%] -right-[10%] aspect-square h-[55%] animate-pulse rounded-full"
          style={{
            background: 'oklch(0.85 0.16 90)',
            filter: 'blur(20px)',
            opacity: 0.3,
          }}
        />
      )}
      <div className="flex items-end justify-between">
        <div>
          <div className="font-bold text-[clamp(0.875rem,15%,1.125rem)] leading-tight tracking-tight">
            {on ? t('on') : t('off')}
          </div>
          <div className="mt-[3%] text-[clamp(8px,9%,11px)] text-muted-foreground">{t('room')}</div>
        </div>
        <button
          type="button"
          onClick={() => setOn((v) => !v)}
          className="no-drag relative aspect-[1.8/1] h-[22%] min-h-4 cursor-pointer rounded-full transition-colors duration-300"
          style={{
            background: on ? 'var(--primary)' : 'var(--muted)',
          }}
          aria-label={t('toggle')}
        >
          <div
            className="absolute top-[10%] aspect-square h-[80%] rounded-full bg-white shadow-sm transition-transform duration-300"
            style={{
              transform: on ? 'translateX(calc(100% - 2px))' : 'translateX(2px)',
            }}
          />
        </button>
      </div>
    </div>
  );
}
