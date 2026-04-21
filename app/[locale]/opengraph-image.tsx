import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { site } from '@/lib/config';
import enMessages from '@/messages/en.json';

export const alt = `${site.name} - ${enMessages.Metadata.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OGImage({
  params,
}: {
  params: { locale: Locale };
}) {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #09090b 0%, #18181b 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo mark */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 240 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="240" height="240" rx="65" fill="#3b82f6" />
          <path
            d="M119 60.8929C119 58.2059 119 56.8625 119.143 55.734C120.177 47.5898 126.59 41.1767 134.734 40.1432C135.862 40 137.206 40 139.893 40H146C166.987 40 184 57.0132 184 78C184 98.9868 166.987 116 146 116H139.893C137.206 116 135.862 116 134.734 115.857C126.59 114.823 120.177 108.41 119.143 100.266C119 99.1375 119 97.7941 119 95.1071V60.8929Z"
            fill="white"
          />
          <path
            d="M119 148.107C119 142.427 119 139.587 119.635 137.26C121.313 131.114 126.114 126.313 132.26 124.635C134.587 124 137.427 124 143.107 124H156C176.987 124 194 141.013 194 162C194 182.987 176.987 200 156 200H143.107C137.427 200 134.587 200 132.26 199.365C126.114 197.687 121.313 192.886 119.635 186.74C119 184.413 119 181.573 119 175.893V148.107Z"
            fill="white"
          />
          <rect x="63" y="152" width="48" height="48" rx="18" fill="white" />
          <rect x="63" y="96" width="48" height="48" rx="18" fill="white" />
          <rect x="63" y="40" width="48" height="48" rx="18" fill="white" />
        </svg>

        {/* Title */}
        <div
          style={{
            marginTop: 32,
            fontSize: 64,
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.02em',
          }}
        >
          {site.name}
        </div>

        {/* Tagline */}
        <div
          style={{
            marginTop: 8,
            fontSize: 28,
            color: '#a1a1aa',
          }}
        >
          {t('tagline')}
        </div>

        {/* URL */}
        <div
          style={{
            marginTop: 32,
            fontSize: 20,
            color: '#3b82f6',
          }}
        >
          brika.dev
        </div>
      </div>
    ),
    size
  );
}
