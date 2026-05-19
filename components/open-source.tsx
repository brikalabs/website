import { Heart } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { SiGithub } from 'react-icons/si';
import { github } from '@/lib/config';
import { AnimatedSection } from './ui/animated-section';
import { BorderGlow } from './ui/border-glow';
import { Button } from './ui/button';

export async function OpenSource() {
  const t = await getTranslations('OpenSource');

  return (
    <AnimatedSection className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <BorderGlow
          colorGlow
          idleOpacity={0.22}
          borderRadius={24}
          glowRadius={48}
          edgeSensitivity={22}
          glowColor="270 70 75"
          colors={['#c084fc', '#f472b6', '#38bdf8']}
          className="corner-squircle"
          innerClassName="corner-squircle relative overflow-hidden px-6 py-16 text-center md:px-16"
        >
          {/* Aurora glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
            <div
              className="aurora-blob absolute -top-20 left-1/3 size-80"
              style={{
                background: 'var(--primary)',
                animation: 'aurora-drift-1 15s ease-in-out infinite',
              }}
            />
            <div
              className="aurora-blob absolute right-1/3 -bottom-20 size-60"
              style={{
                background: 'var(--accent)',
                animation: 'aurora-drift-2 20s ease-in-out infinite',
              }}
            />
          </div>

          <div className="relative">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 font-medium text-primary text-sm backdrop-blur-2xl">
              <Heart className="size-3.5" />
              {t('badge')}
            </div>

            <h2 className="mb-4 font-bold text-3xl tracking-tight md:text-4xl">{t('heading')}</h2>
            <p className="mx-auto mb-8 max-w-lg text-muted-foreground">{t('description')}</p>

            <Button
              href={github.url}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              size="lg"
            >
              <SiGithub className="size-4" />
              {t('viewOnGithub')}
            </Button>
          </div>
        </BorderGlow>
      </div>
    </AnimatedSection>
  );
}
