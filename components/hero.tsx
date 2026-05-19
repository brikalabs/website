import { ArrowDown, Sparkles, Tag } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { SiGithub } from 'react-icons/si';
import { github } from '@/lib/config';
import { BorderGlow } from './ui/border-glow';
import { BrikaLogo } from './ui/brika-logo';
import { Button } from './ui/button';
import { ClickSpark } from './ui/click-spark';
import { PixelBlastBackground } from './ui/pixel-blast';
import { RotatingText } from './ui/rotating-text';
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
    <section className="hero-parallax relative isolate flex min-h-svh flex-col items-center justify-center overflow-hidden px-6">
      {/* PixelBlast — the scrim below softens contrast under the text;
          edgeFade handles falloff toward the section edges. */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-40">
        <PixelBlastBackground
          className="absolute inset-0 h-full w-full"
          variant="circle"
          pixelSize={4}
          patternScale={3}
          patternDensity={0.9}
          pixelSizeJitter={0.3}
          enableRipples={false}
          liquid={false}
          speed={0.4}
          edgeFade={0.35}
          transparent
        />
      </div>

      {/* Soft scrim behind the content to guarantee text contrast in light
          mode, even when a wavefront pulse passes through. */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 55% 50% at center, var(--background) 0%, transparent 65%)',
          opacity: 0.45,
        }}
      />

      <div className="max-w-4xl text-center">
        {/* Hero logo */}
        <div className="reveal-up mb-10 flex justify-center" style={{ animationDelay: '50ms' }}>
          <BorderGlow
            spin
            spinDuration="6s"
            borderRadius={34}
            glowRadius={140}
            glowColor="265 80 70"
            glowIntensity={2.2}
            coneSpread={20}
            colors={['#c084fc', '#f472b6', '#38bdf8']}
            backgroundColor="#000"
            className="corner-squircle size-32 sm:size-36 md:size-40"
            innerClassName="corner-squircle flex h-full w-full items-center justify-center"
          >
            <BrikaLogo className="size-24 text-white sm:size-28 md:size-32" />
          </BorderGlow>
        </div>

        {/* Badges */}
        <div
          className="reveal-up mb-8 flex flex-wrap items-center justify-center gap-3"
          style={{
            animationDelay: '200ms',
          }}
        >
          <div className="badge-glow inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/20 px-4 py-1.5 font-medium text-primary text-sm backdrop-blur-2xl">
            <Sparkles className="size-3.5 shrink-0" />
            <span>{t('badge')}</span>
          </div>
          {release && (
            <a
              href={release.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/80 px-3 py-1.5 font-medium text-muted-foreground text-xs backdrop-blur-2xl transition-colors hover:bg-surface hover:text-foreground"
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
              <span className="gradient-flow-text inline-block">{t('titleLine2')}</span>
            </span>
          </span>
        </h1>

        <p
          className="reveal-up mx-auto mt-8 flex flex-wrap items-baseline justify-center gap-x-3 font-semibold text-2xl text-muted-foreground sm:text-3xl md:text-4xl"
          style={{
            animationDelay: '900ms',
          }}
        >
          <span>{t('subheadingBefore')}</span>
          <RotatingText
            texts={t.raw('subheadingNouns') as string[]}
            charClassName="gradient-flow-text"
            rotationInterval={2800}
          />
        </p>

        <p
          className="reveal-up mx-auto mt-5 max-w-xl text-base text-muted-foreground leading-relaxed sm:text-lg"
          style={{
            animationDelay: '1050ms',
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
