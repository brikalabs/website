import { ArrowDown, Sparkles, Tag } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { SiGithub } from 'react-icons/si';
import { github } from '@/lib/config';
import { BrikaLogo } from './ui/brika-logo';
import { Button } from './ui/button';
import { ClickSpark } from './ui/click-spark';
import { DotGridBackground } from './ui/dot-grid-bg';
import { GradientFlowText } from './ui/gradient-flow-text';
import { StarBorder } from './ui/star-border';

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
      {/* Network mesh — vignette mask fades dots under the text so the
          content stays readable; mesh stays visible around the edges. */}
      <div className="mask-[radial-gradient(ellipse_60%_55%_at_center,transparent_0%,rgba(0,0,0,0.25)_45%,black_85%)] pointer-events-none absolute inset-0 -z-10">
        <DotGridBackground
          className="absolute inset-0 h-full w-full"
          density={60}
          connectionDistance={150}
          driftAmplitude={4}
          breatheInterval={2400}
        />
      </div>

      {/* Soft scrim behind the content to guarantee text contrast in light
          mode, even when a wavefront pulse passes through. */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 55% 50% at center, var(--background) 0%, transparent 65%)',
          opacity: 0.55,
        }}
      />

      <div className="max-w-4xl text-center">
        {/* Hero logo */}
        <div className="reveal-up mb-10 flex justify-center" style={{ animationDelay: '50ms' }}>
          <div className="hero-icon corner-squircle rounded-[28%] p-0.5">
            <div className="corner-squircle relative z-10 flex size-20 items-center justify-center rounded-[28%] bg-black sm:size-24">
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
              className="text-reveal-word"
              style={{
                animationDelay: '770ms',
              }}
            >
              <GradientFlowText text={t('titleLine2')} speed={9} />
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
        <ClickSpark
          sparkColor="oklch(0.7 0.16 265)"
          sparkRadius={22}
          sparkCount={12}
          className="reveal-up relative mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <span style={{ animationDelay: '1100ms' }}>
            <StarBorder className="rounded-full" color="oklch(0.85 0.16 200)" speed="5s">
              <Button href="#install" variant="filled" size="lg" className="group rounded-full">
                {t('getStarted')}
                <ArrowDown className="size-4 transition-transform group-hover:translate-y-0.5" />
              </Button>
            </StarBorder>
          </span>
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
        </ClickSpark>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <ArrowDown className="scroll-hint size-5 text-muted-foreground" />
      </div>
    </section>
  );
}
