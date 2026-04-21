'use client';

import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  Snowflake,
  Sun,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';
import type { WeatherIcon } from '@/lib/weather';
import { weatherTheme } from '@/lib/weather';
import { WeatherContext } from './weather-context';

const iconMap: Record<
  WeatherIcon,
  React.ComponentType<{
    className?: string;
    style?: React.CSSProperties;
  }>
> = {
  sun: Sun,
  cloud: Cloud,
  'cloud-fog': CloudFog,
  'cloud-drizzle': CloudDrizzle,
  'cloud-rain': CloudRain,
  snowflake: Snowflake,
  'cloud-lightning': CloudLightning,
};

const DEFAULT_CODE = 0;

export default function WeatherBrick() {
  const t = useTranslations('Bricks.weather');
  const weather = useContext(WeatherContext);

  const temp = weather?.temperature ?? 22;
  const code = weather?.weatherCode ?? DEFAULT_CODE;
  const city = weather?.city ?? t('defaultCity');
  const theme = weatherTheme(code);
  const Icon = iconMap[theme.icon];

  return (
    <div
      className="relative flex h-full flex-col justify-end overflow-hidden px-[10%] pb-[10%]"
      style={{
        background: theme.bg,
      }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute -top-[10%] -right-[10%] aspect-square h-[55%] animate-pulse rounded-full"
        style={{
          background: theme.glow,
          filter: 'blur(24px)',
          opacity: 0.35,
        }}
      />
      {/* Weather icon */}
      <Icon
        className="absolute top-[8%] right-[8%] h-[18%] w-auto opacity-70"
        style={{
          color: theme.glow,
        }}
      />
      <div>
        <div className="font-bold text-[clamp(1.25rem,22%,1.5rem)] leading-tight tracking-tight">
          {temp}°C
        </div>
        <div className="mt-[3%] text-[clamp(8px,9%,11px)] text-muted-foreground">
          {t(theme.key)} &middot; {city}
        </div>
      </div>
    </div>
  );
}
