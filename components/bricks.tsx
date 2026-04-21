'use client';

import { Gauge, GripVertical, LayoutGrid, Lightbulb, Music, Sun, Timer, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Layout, LayoutItem } from 'react-grid-layout';
import { ReactGridLayout } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import type { WeatherData } from '@/lib/weather';
import { WeatherContext } from './bricks/weather-context';
import { AnimatedSection } from './ui/animated-section';

const GAP = 8;
const COLS = 3;
const MAX_GRID_SIZE = 400;

const brickContent: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  weather: lazy(() => import('./bricks/weather-brick')),
  energy: lazy(() => import('./bricks/energy-brick')),
  timer: lazy(() => import('./bricks/timer-brick')),
  cpu: lazy(() => import('./bricks/cpu-brick')),
  spotify: lazy(() => import('./bricks/spotify-brick')),
  lights: lazy(() => import('./bricks/lights-brick')),
};

type BrickId = 'weather' | 'energy' | 'timer' | 'cpu' | 'spotify' | 'lights';

const brickIcons: Record<
  BrickId,
  React.ComponentType<{
    className?: string;
  }>
> = {
  weather: Sun,
  energy: Zap,
  timer: Timer,
  cpu: Gauge,
  spotify: Music,
  lights: Lightbulb,
};

const brickIds: BrickId[] = ['weather', 'energy', 'timer', 'cpu', 'spotify', 'lights'];

const initialLayout: LayoutItem[] = [
  {
    i: 'weather',
    x: 0,
    y: 0,
    w: 1,
    h: 1,
  },
  {
    i: 'spotify',
    x: 1,
    y: 0,
    w: 2,
    h: 2,
  },
  {
    i: 'energy',
    x: 0,
    y: 1,
    w: 1,
    h: 1,
  },
  {
    i: 'timer',
    x: 0,
    y: 2,
    w: 1,
    h: 1,
  },
  {
    i: 'cpu',
    x: 1,
    y: 2,
    w: 1,
    h: 1,
  },
  {
    i: 'lights',
    x: 2,
    y: 2,
    w: 1,
    h: 1,
  },
];

function BrickCard({
  id,
}: Readonly<{
  id: BrickId;
}>) {
  const t = useTranslations('Bricks.labels');
  const Content = brickContent[id];
  const Icon = brickIcons[id];

  return (
    <div className="group corner-squircle relative flex h-full select-none flex-col overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-md">
      <div className="flex items-center gap-1.5 px-2.5 pt-2 pb-1.5">
        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate font-medium text-[11px] text-muted-foreground">
          {t(id)}
        </span>
        <div className="drag-handle cursor-grab rounded p-0.5 transition-colors hover:bg-muted active:cursor-grabbing">
          <GripVertical className="size-3 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>
      <div className="no-drag corner-squircle mx-0.5 mb-0.5 min-h-0 flex-1 overflow-hidden rounded-[13px]">
        {Content && (
          <Suspense fallback={<div className="h-full animate-pulse bg-muted/30" />}>
            <Content />
          </Suspense>
        )}
      </div>
    </div>
  );
}

function DraggableGrid() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridWidth, setGridWidth] = useState(MAX_GRID_SIZE);
  const [layout, setLayout] = useState(initialLayout);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? MAX_GRID_SIZE;
      setGridWidth(Math.min(MAX_GRID_SIZE, Math.floor(width)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const colWidth = (gridWidth - GAP * (COLS + 1)) / COLS;
  const rowHeight = colWidth;

  const handleLayoutChange = useCallback((newLayout: Layout) => {
    setLayout([...newLayout]);
  }, []);

  return (
    <div ref={containerRef} className="brick-grid mx-auto w-full max-w-100">
      <ReactGridLayout
        width={gridWidth}
        layout={layout}
        cols={COLS}
        rowHeight={rowHeight}
        isDraggable
        isResizable={false}
        draggableHandle=".drag-handle"
        draggableCancel=".no-drag"
        onLayoutChange={handleLayoutChange}
        compactType="vertical"
        containerPadding={[0, 0]}
        margin={[GAP, GAP]}
      >
        {brickIds.map((id) => (
          <div key={id}>
            <BrickCard id={id} />
          </div>
        ))}
      </ReactGridLayout>
    </div>
  );
}

export function Bricks({
  weather,
}: Readonly<{
  weather?: WeatherData | null;
}>) {
  const t = useTranslations('Bricks');
  const weatherValue = useMemo(() => weather ?? null, [weather]);

  return (
    <WeatherContext.Provider value={weatherValue}>
      <AnimatedSection id="bricks" className="py-20 md:py-28">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <LayoutGrid className="size-5 text-primary" />
                <span className="font-semibold text-primary text-sm">{t('eyebrow')}</span>
              </div>
              <h2 className="mb-4 font-bold text-3xl tracking-tight md:text-4xl">{t('heading')}</h2>
              <p className="text-muted-foreground leading-relaxed">{t('subheading')}</p>
              <ul className="mt-6 space-y-2 text-muted-foreground text-sm">
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" /> {t('bulletDragDrop')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" /> {t('bulletRealTime')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" /> {t('bulletInteractive')}
                </li>
              </ul>
              <p className="mt-4 text-muted-foreground text-xs italic">{t('hint')}</p>
            </div>

            <DraggableGrid />
          </div>
        </div>
      </AnimatedSection>
    </WeatherContext.Provider>
  );
}
