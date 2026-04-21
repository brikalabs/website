import { ArrowDown, Sparkles, Tag } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { SiGithub } from 'react-icons/si';
import { github } from '@/lib/config';
import { BrikaLogo } from './ui/brika-logo';
import { Button } from './ui/button';

interface HeroProps {
  release?: {
    version: string;
    url: string;
  } | null;
}

export async function Hero({ release }: Readonly<HeroProps>) {
  const t = await getTranslations('Hero');

  return (
    <section className="hero-parallax relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-6">
      {/* Aurora blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="aurora-blob absolute top-[15%] left-[20%] size-[500px] bg-primary md:size-[700px]"
          style={{
            animation: 'aurora-drift-1 20s ease-in-out infinite',
          }}
        />
        <div
          className="aurora-blob absolute top-[40%] right-[15%] size-[400px] bg-accent md:size-[600px]"
          style={{
            animation: 'aurora-drift-2 25s ease-in-out infinite',
          }}
        />
        <div
          className="aurora-blob absolute bottom-[10%] left-[40%] size-[450px] bg-primary md:size-[650px]"
          style={{
            animation: 'aurora-drift-3 18s ease-in-out infinite',
          }}
        />
      </div>

      {/* Dot grid */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-[0.04]" />

      <div className="max-w-4xl text-center">
        {/* Hero logo */}
        <div className="reveal-up mb-10 flex justify-center" style={{ animationDelay: '50ms' }}>
          <div className="hero-icon corner-squircle rounded-full p-0.5">
            <div className="corner-squircle relative z-10 flex size-20 items-center justify-center rounded-full bg-black sm:size-24">
              <BrikaLogo className="size-16 text-white sm:size-20" />
            </div>
          </div>
        </div>

        {/* Badges */}
        <div
          className="reveal-up mb-8 flex flex-wrap items-center justify-center gap-3"
          style={{
            animationDelay: '200ms',
          }}
        >
          <div className="badge-glow inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 font-medium text-primary text-sm">
            <Sparkles className="size-3.5 shrink-0" />
            <span>{t('badge')}</span>
          </div>
          {release && (
            <a
              href={release.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/50 px-3 py-1.5 font-medium text-muted-foreground text-xs backdrop-blur-sm transition-colors hover:bg-surface hover:text-foreground"
            >
              <Tag className="size-3 shrink-0" />
              {release.version}
            </a>
          )}
        </div>

        <h1 className="font-extrabold text-4xl leading-[1.1] tracking-tight sm:text-5xl md:text-7xl">
          <span className="block overflow-hidden pb-1">
            <span
              className="text-reveal-word"
              style={{
                animationDelay: '350ms',
              }}
            >
              {t('titleLine1Word1')}
            </span>{' '}
            <span
              className="text-reveal-word"
              style={{
                animationDelay: '470ms',
              }}
            >
              {t('titleLine1Word2')}
            </span>{' '}
            <span
              className="text-reveal-word"
              style={{
                animationDelay: '590ms',
              }}
            >
              {t('titleLine1Word3')}
            </span>
          </span>
          <span className="block overflow-hidden pb-1">
            <span
              className="hero-gradient text-reveal-word"
              style={{
                animationDelay: '770ms',
              }}
            >
              {t('titleLine2')}
            </span>
          </span>
        </h1>

        <p
          className="reveal-up mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed"
          style={{
            animationDelay: '950ms',
          }}
        >
          {t('tagline')}
        </p>

        {/* CTAs */}
        <div
          className="reveal-up mt-10 flex flex-wrap items-center justify-center gap-4"
          style={{
            animationDelay: '1100ms',
          }}
        >
          <Button href="#install" variant="filled" size="lg" className="group">
            {t('getStarted')}
            <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
          </Button>
          <Button
            href={github.url}
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="lg"
          >
            <SiGithub className="size-4" />
            {t('github')}
          </Button>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <ArrowDown className="scroll-hint size-5 text-muted-foreground" />
      </div>
    </section>
  );
}
