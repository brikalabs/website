import type { Metadata } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { type Locale, routing } from '@/i18n/routing';
import { github, site } from '@/lib/config';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const OG_LOCALE: Record<Locale, string> = {
  en: 'en_US',
  fr: 'fr_FR',
};

function pathForLocale(locale: Locale): string {
  return locale === 'en' ? '/' : `/${locale}`;
}

function absoluteUrlForLocale(locale: Locale): string {
  return locale === 'en' ? site.url : `${site.url}/${locale}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  const title = t('title');
  const description = t('description');

  return {
    title,
    description,
    keywords: [
      'automation',
      'self-hosted',
      'local-first',
      'home automation',
      'workflow',
      'plugins',
      'open source',
      'brika',
      'IoT',
      'dashboard',
    ],
    authors: [
      {
        name: github.owner,
        url: github.url,
      },
    ],
    creator: github.owner,
    metadataBase: new URL(site.url),
    alternates: {
      canonical: pathForLocale(locale),
      languages: {
        en: site.url,
        fr: `${site.url}/fr`,
        'x-default': site.url,
      },
    },
    openGraph: {
      title,
      description,
      url: absoluteUrlForLocale(locale),
      siteName: site.name,
      type: 'website',
      locale: OG_LOCALE[locale],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// Inline script to prevent flash of wrong theme
const themeScript = `
  (function(){
    try {
      var t = localStorage.getItem('theme');
      var d = t === 'dark' || (!t && matchMedia('(prefers-color-scheme:dark)').matches);
      document.documentElement.classList.toggle('dark', d);
    } catch(e) {}
  })()
`;

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'Metadata' });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: site.name,
    description: t('description'),
    url: site.url,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'macOS, Linux, Windows, Docker',
    license: `https://github.com/${github.owner}/${github.repo}/blob/main/LICENSE`,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    isAccessibleForFree: true,
    codeRepository: `https://github.com/${github.owner}/${github.repo}`,
  };

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeScript,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>
      <body className="min-h-screen font-sans">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
