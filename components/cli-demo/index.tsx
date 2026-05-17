'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { AnimatedSection } from '../ui/animated-section';
import { Terminal } from '../ui/terminal';
import { BrixHeader } from './brix';
import { B, Dim, Green } from './colors';
import { useColumns } from './hooks';
import { Divider } from './primitives';
import { MenuBar, ShellFooter, TABS, type View } from './shell';
import { DashboardView } from './view-dashboard';
import { INITIAL_LOGS, type LogLine, LogsView, NEW_LOG_POOL } from './view-logs';
import { PluginsView } from './view-plugins';
import { WorkflowsView } from './view-workflows';

/*
 * Faithful mock of the real brika fullscreen TUI (Ink-based, see
 * apps/console/src in github.com/brikalabs/brika). The TUI is a sidebar app
 * shell: window chrome with title + hub status, Brix mascot header, MenuBar
 * tabs, active route Outlet, and a hint-bar footer.
 *
 * Auto-cycles through Dashboard / Plugins / Workflows / Logs; clicking a tab
 * pauses the cycle and switches view. Glyphs / colors / labels are copied
 * from the upstream source, not invented.
 */

const VIEW_CYCLE_MS = 7000;
const LOG_APPEND_MS = 2800;

export function CliDemo() {
  const t = useTranslations('CliDemo');
  const [active, setActive] = useState<View>('dashboard');
  const [autoCycle, setAutoCycle] = useState(true);
  const [logs, setLogs] = useState<LogLine[]>(INITIAL_LOGS);
  const newLogIdxRef = useRef(0);
  const measureRef = useRef<HTMLDivElement>(null);
  const cols = useColumns(measureRef);

  // Auto-cycle through views unless the user clicked a tab.
  useEffect(() => {
    if (!autoCycle) {
      return;
    }
    const advance = (cur: View): View => {
      const i = TABS.findIndex((x) => x.key === cur);
      return TABS[(i + 1) % TABS.length].key;
    };
    const id = setInterval(() => setActive(advance), VIEW_CYCLE_MS);
    return () => clearInterval(id);
  }, [autoCycle]);

  // Append a new log line periodically while Logs is the active view.
  useEffect(() => {
    if (active !== 'logs') {
      return;
    }
    const id = setInterval(() => {
      const next = NEW_LOG_POOL[newLogIdxRef.current % NEW_LOG_POOL.length];
      newLogIdxRef.current += 1;
      setLogs((prev) => [...prev.slice(-20), next]);
    }, LOG_APPEND_MS);
    return () => clearInterval(id);
  }, [active]);

  function onPickTab(view: View) {
    setActive(view);
    setAutoCycle(false);
  }

  return (
    <AnimatedSection id="cli" className="py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="mb-2 text-center font-bold text-3xl tracking-tight md:text-4xl">
          {t('heading')}
        </h2>
        <p className="mb-10 text-center text-muted-foreground">{t('subheading')}</p>

        <div className="mx-auto max-w-3xl">
          <Terminal
            actions={
              <span className="font-mono text-xs">
                <B>Brika</B> <Dim>· v0.1.0 · </Dim>
                <Green>● running</Green> <Dim>pid 17234</Dim>
              </span>
            }
          >
            <div ref={measureRef} className="tui-mono text-xs sm:text-sm">
              <BrixHeader cols={cols} />
              <div className="my-3">
                <Divider cols={cols} />
              </div>
              <MenuBar active={active} onPick={onPickTab} />
              <div className="my-3">
                <Divider cols={cols} />
              </div>
              <div className="min-h-40">
                {active === 'dashboard' && <DashboardView cols={cols} />}
                {active === 'plugins' && <PluginsView />}
                {active === 'logs' && <LogsView logs={logs} cols={cols} />}
                {active === 'workflows' && <WorkflowsView />}
              </div>
              <div className="my-3">
                <Divider cols={cols} />
              </div>
              <ShellFooter />
            </div>
          </Terminal>
        </div>
      </div>
    </AnimatedSection>
  );
}
