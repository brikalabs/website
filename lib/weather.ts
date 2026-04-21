const WEATHER_BASE = 'https://api.open-meteo.com/v1';

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  city: string;
}

export type WeatherIcon =
  | 'sun'
  | 'cloud'
  | 'cloud-fog'
  | 'cloud-drizzle'
  | 'cloud-rain'
  | 'snowflake'
  | 'cloud-lightning';

type WeatherKey =
  | 'clear'
  | 'cloudy'
  | 'foggy'
  | 'drizzle'
  | 'rainy'
  | 'snowy'
  | 'showers'
  | 'stormy';

interface WeatherTheme {
  key: WeatherKey;
  icon: WeatherIcon;
  glow: string;
  bg: string;
}

/** WMO weather code → visual theme */
export function weatherTheme(code: number): WeatherTheme {
  if (code === 0) {
    return {
      key: 'clear',
      icon: 'sun',
      glow: 'oklch(0.85 0.15 75)',
      bg: 'oklch(0.85 0.15 75 / 0.08)',
    };
  }
  if (code <= 3) {
    return {
      key: 'cloudy',
      icon: 'cloud',
      glow: 'oklch(0.7 0.03 250)',
      bg: 'oklch(0.7 0.03 250 / 0.08)',
    };
  }
  if (code <= 48) {
    return {
      key: 'foggy',
      icon: 'cloud-fog',
      glow: 'oklch(0.75 0.02 250)',
      bg: 'oklch(0.75 0.02 250 / 0.06)',
    };
  }
  if (code <= 55) {
    return {
      key: 'drizzle',
      icon: 'cloud-drizzle',
      glow: 'oklch(0.7 0.12 230)',
      bg: 'oklch(0.7 0.12 230 / 0.08)',
    };
  }
  if (code <= 65) {
    return {
      key: 'rainy',
      icon: 'cloud-rain',
      glow: 'oklch(0.6 0.15 250)',
      bg: 'oklch(0.6 0.15 250 / 0.1)',
    };
  }
  if (code <= 77) {
    return {
      key: 'snowy',
      icon: 'snowflake',
      glow: 'oklch(0.9 0.05 230)',
      bg: 'oklch(0.9 0.05 230 / 0.1)',
    };
  }
  if (code <= 82) {
    return {
      key: 'showers',
      icon: 'cloud-rain',
      glow: 'oklch(0.65 0.14 240)',
      bg: 'oklch(0.65 0.14 240 / 0.1)',
    };
  }
  return {
    key: 'stormy',
    icon: 'cloud-lightning',
    glow: 'oklch(0.55 0.18 290)',
    bg: 'oklch(0.55 0.18 290 / 0.12)',
  };
}

import type { Locale } from '@/i18n/routing';
import { translateBatch } from '@/lib/translate';

export async function fetchWeatherData(
  latitude: string,
  longitude: string,
  city: string,
  locale: Locale
): Promise<WeatherData | null> {
  try {
    const params = new URLSearchParams({
      latitude,
      longitude,
      current: 'temperature_2m,weather_code',
      timezone: 'auto',
    });
    const res = await fetch(`${WEATHER_BASE}/forecast?${params}`, {
      next: {
        revalidate: 600,
      },
    });
    if (!res.ok) {
      return null;
    }
    const data = (await res.json()) as {
      current: {
        temperature_2m: number;
        weather_code: number;
      };
    };
    const decoded = decodeURIComponent(city);
    const [localizedCity] = await translateBatch([decoded], locale);
    return {
      temperature: Math.round(data.current.temperature_2m),
      weatherCode: data.current.weather_code,
      city: localizedCity ?? decoded,
    };
  } catch {
    return null;
  }
}
