'use client';

import { BookOpen } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { SiGithub } from 'react-icons/si';
import { github, site } from '@/lib/config';
import { cn } from '@/lib/utils';
import { LocaleToggle } from './locale-toggle';
import { BrikaLogo } from './ui/brika-logo';
import { Button } from './ui/button';
import { ThemeToggle } from './ui/theme-toggle';

const iconLink =
  'inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50';

export function Nav() {
  const t = useTranslations('Nav');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, {
      passive: true,
    });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'nav-entrance fixed inset-x-0 top-0 z-50 transition-[backdrop-filter] duration-500',
        scrolled
          ? 'border-border/50 border-b bg-background/70 backdrop-blur-2xl backdrop-saturate-150'
          : 'bg-transparent'
      )}
    >
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a href="#top" className="group flex items-center gap-1">
          <BrikaLogo className="size-7" />
          <span className="font-extrabold text-lg tracking-tight">BRIKA</span>
        </a>

        <div className="flex items-center gap-1">
          <a
            href={site.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('documentation')}
            className={iconLink}
          >
            <BookOpen className="size-4" />
          </a>
          <a
            href={github.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t('github')}
            className={iconLink}
          >
            <SiGithub className="size-4" />
          </a>
          <div className="ml-1 h-5 w-px bg-border" />
          <LocaleToggle />
          <ThemeToggle />
          <Button href="#install" variant="filled" size="sm" className="ml-2 font-semibold">
            {t('getBrika')}
          </Button>
        </div>
      </nav>
    </header>
  );
}
