import { ArrowRight, Code, Puzzle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { npm, site } from '@/lib/config';
import { fetchPlugins } from '@/lib/plugins';
import { PluginGrid } from './plugin-grid';
import { AnimatedSection } from './ui/animated-section';
import { Button } from './ui/button';
import { Cmd, Comment, Flag, Line, Terminal } from './ui/terminal';

export async function Plugins({ locale }: Readonly<{ locale: Locale }>) {
  const [plugins, t] = await Promise.all([
    fetchPlugins(locale),
    getTranslations({ locale, namespace: 'Plugins' }),
  ]);

  if (plugins.length === 0) return null;

  return (
    <AnimatedSection id="plugins" className="overflow-x-clip py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Puzzle className="size-3.5" />
            {t('badge', { count: plugins.length })}
          </div>
        </div>
        <h2 className="mb-2 text-center text-3xl font-bold tracking-tight md:text-4xl">
          {t('heading')}
        </h2>
        <p className="mb-12 text-center text-muted-foreground">
          {t('subheading')}
        </p>
      </div>
      <PluginGrid plugins={plugins} />

      {/* Build your own CTA */}
      <div className="mx-auto mt-16 max-w-4xl px-6">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
              <Code className="size-4" />
              {t('devExperience')}
            </p>
            <h3 className="mb-3 text-2xl font-bold tracking-tight">{t('buildYourOwn')}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t('buildYourOwnDescription')}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                href={site.docsUrl}
                target="_blank"
                rel="noopener noreferrer"
                variant="outline"
                size="md"
              >
                {t('readDocs')}
                <ArrowRight className="size-3.5" />
              </Button>
              <Button
                href={`${npm.packageUrl}/@brika/sdk`}
                target="_blank"
                rel="noopener noreferrer"
                variant="glow"
                size="md"
                className="px-4"
              >
                <span className="font-mono text-xs text-muted-foreground">npm</span> @brika/sdk
              </Button>
            </div>
          </div>

          <Terminal>
            <Comment>{t('scaffoldComment')}</Comment>
            <Line>
              <Cmd>bun</Cmd> create <Flag>brika</Flag> my-plugin
            </Line>
            <div className="my-2" />
            <Comment>{t('devComment')}</Comment>
            <Line>
              <Cmd>cd</Cmd> my-plugin
            </Line>
            <Line>
              <Cmd>bun</Cmd> dev
            </Line>
          </Terminal>
        </div>
      </div>
    </AnimatedSection>
  );
}
