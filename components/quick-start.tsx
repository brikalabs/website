'use client';

import { useTranslations } from 'next-intl';
import { type ComponentType, type ReactNode, useEffect, useState } from 'react';
import { FaApple, FaDocker, FaWindows } from 'react-icons/fa';
import { docker, site } from '@/lib/config';
import { cn } from '@/lib/utils';
import { AnimatedSection } from './ui/animated-section';
import { CopyButton } from './ui/copy-button';
import { Cmd, Comment, Cursor, Flag, Line, Terminal } from './ui/terminal';

type Tab = 'unix' | 'windows' | 'docker';
type Channel = 'stable' | 'canary';

type TabConfig = {
  value: Tab;
  icon: ComponentType<{ className?: string }>;
  command: string;
  body: ReactNode;
};

function getTabs(channel: Channel): TabConfig[] {
  const isCanary = channel === 'canary';
  const dockerTag = isCanary ? 'canary' : 'latest';
  const dockerImage = `${docker.image}:${dockerTag}`;

  return [
    {
      value: 'unix',
      icon: FaApple,
      command: isCanary
        ? `curl -fsSL ${site.url}/install.sh | bash -s canary`
        : `curl -fsSL ${site.url}/install.sh | bash`,
      body: isCanary ? (
        <>
          <Cmd>curl</Cmd> <Flag>-fsSL</Flag> <span>{site.url}/install.sh</span> <Flag>|</Flag>{' '}
          <Cmd>bash</Cmd> <Flag>-s</Flag> <span>canary</span>
        </>
      ) : (
        <>
          <Cmd>curl</Cmd> <Flag>-fsSL</Flag> <span>{site.url}/install.sh</span> <Flag>|</Flag>{' '}
          <Cmd>bash</Cmd>
        </>
      ),
    },
    {
      value: 'windows',
      icon: FaWindows,
      command: isCanary
        ? `irm ${site.url}/install.ps1 -out i.ps1; ./i.ps1 canary`
        : `iwr -useb ${site.url}/install.ps1 | iex`,
      body: isCanary ? (
        <>
          <Cmd>irm</Cmd> <span>{site.url}/install.ps1</span> <Flag>-out</Flag> <span>i.ps1</span>
          <Flag>;</Flag> <Cmd>./i.ps1</Cmd> <span>canary</span>
        </>
      ) : (
        <>
          <Cmd>iwr</Cmd> <Flag>-useb</Flag> <span>{site.url}/install.ps1</span> <Flag>|</Flag>{' '}
          <Cmd>iex</Cmd>
        </>
      ),
    },
    {
      value: 'docker',
      icon: FaDocker,
      command: `docker run -d -p ${docker.port}:${docker.port} --name brika ${dockerImage}`,
      body: (
        <>
          <Cmd>docker</Cmd> <Flag>run -d -p</Flag>{' '}
          <span>
            {docker.port}:{docker.port}
          </span>{' '}
          <Flag>--name</Flag> <span>brika {dockerImage}</span>
        </>
      ),
    },
  ];
}

const prompts: Record<Tab, string> = {
  unix: '$',
  windows: '>',
  docker: '$',
};

export function QuickStart() {
  const t = useTranslations('QuickStart');
  const [active, setActive] = useState<Tab>('unix');
  const [channel, setChannel] = useState<Channel>('stable');

  useEffect(() => {
    if (navigator.userAgent.toLowerCase().includes('win')) {
      setActive('windows');
    }
  }, []);

  const tabs = getTabs(channel);
  const current = tabs.find((tab) => tab.value === active) ?? tabs[0];
  const commentKey = channel === 'canary' ? 'commentCanary' : 'commentStable';
  const currentNote =
    current.value === 'docker'
      ? t('docker.note', { port: docker.port })
      : t(`${current.value}.note`);
  const currentOutput =
    current.value === 'docker'
      ? t('docker.output', { port: docker.port })
      : t(`${current.value}.output`);
  const currentComment = t(`${current.value}.${commentKey}`);

  return (
    <AnimatedSection id="install" className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-2 text-center font-bold text-3xl tracking-tight md:text-4xl">
          {t('heading')}
        </h2>
        <p className="mb-10 text-center text-muted-foreground">{t('subheading')}</p>

        <div className="mx-auto max-w-2xl">
          <Terminal
            actions={
              <>
                <div className="flex items-center gap-1" role="tablist">
                  {tabs.map((tab) => (
                    <button
                      key={tab.value}
                      type="button"
                      role="tab"
                      aria-selected={active === tab.value}
                      onClick={() => setActive(tab.value)}
                      className={cn(
                        'flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 font-medium text-xs transition-colors sm:gap-1.5 sm:px-3',
                        active === tab.value
                          ? 'bg-primary/15 text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <tab.icon className="size-3.5" />
                      <span className="hidden sm:inline">{t(`${tab.value}.label`)}</span>
                      <span className="sm:hidden">{t(`${tab.value}.shortLabel`)}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center rounded-full border border-code-border bg-code-bg p-0.5">
                    <button
                      type="button"
                      onClick={() => setChannel('stable')}
                      className={cn(
                        'cursor-pointer rounded-full px-2 py-0.5 font-semibold text-[10px] uppercase tracking-wider transition-all sm:px-2.5',
                        channel === 'stable'
                          ? 'bg-primary/15 text-primary'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      )}
                    >
                      stable
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel('canary')}
                      className={cn(
                        'cursor-pointer rounded-full px-2 py-0.5 font-semibold text-[10px] uppercase tracking-wider transition-all sm:px-2.5',
                        channel === 'canary'
                          ? 'bg-primary/15 text-primary'
                          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                      )}
                    >
                      canary
                    </button>
                  </div>
                  <div className="border-code-border border-l pl-2 sm:pl-3">
                    <CopyButton value={current.command} />
                  </div>
                </div>
              </>
            }
          >
            <Comment>{currentComment}</Comment>
            <div className="h-3" />
            <Line prompt={prompts[active]}>
              <span className="break-all">{current.body}</span>
              <Cursor />
            </Line>
            <div className="h-2" />
            <div className="select-none text-primary/70 text-xs">{currentOutput}</div>
          </Terminal>

          <p className="mt-4 text-center text-muted-foreground text-xs">
            {channel === 'canary' && (
              <span className="text-warning">{t('unstableCanary')} &middot; </span>
            )}
            {currentNote}
          </p>
        </div>
      </div>
    </AnimatedSection>
  );
}
