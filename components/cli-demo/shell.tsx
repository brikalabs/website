'use client';

import { cn } from '@/lib/utils';
import { C, Cyan, Dim, G, Green, Kbd, R, Red, Yellow } from './colors';

export type View = 'dashboard' | 'plugins' | 'workflows' | 'logs';

export const TABS: ReadonlyArray<{ key: View; label: string; idx: number }> = [
  { key: 'dashboard', label: 'Dashboard', idx: 1 },
  { key: 'plugins', label: 'Plugins', idx: 2 },
  { key: 'workflows', label: 'Workflows', idx: 3 },
  { key: 'logs', label: 'Logs', idx: 4 },
];

/**
 * MenuBar — TUI tab strip. Each tab has a `[N] Label` row over an underline
 * row (`━` cyan for active, `─` dim for inactive), matching the real TUI's
 * <MenuBar> primitive. Native `<button>` per tab keeps keyboard/screen-reader
 * support free.
 */
export function MenuBar({ active, onPick }: Readonly<{ active: View; onPick: (v: View) => void }>) {
  return (
    <div className="font-mono">
      <div>
        {TABS.map((t, i) => {
          const label = `[${t.idx}] ${t.label}`;
          const isActive = t.key === active;
          return (
            <span key={t.key}>
              <button
                type="button"
                onClick={() => onPick(t.key)}
                className={cn(
                  'cursor-pointer bg-transparent p-0 font-inherit text-inherit transition-colors hover:text-foreground',
                  // font-medium instead of bold to keep monospace columns
                  // stable; visual emphasis comes from the cyan color +
                  // heavy ━ underline row below.
                  isActive ? cn('font-medium', C) : 'text-muted-foreground'
                )}
              >
                {label}
              </button>
              {i < TABS.length - 1 && '   '}
            </span>
          );
        })}
      </div>
      <div aria-hidden>
        {TABS.map((t, i) => {
          const label = `[${t.idx}] ${t.label}`;
          const isActive = t.key === active;
          return (
            <span key={t.key}>
              <span className={isActive ? C : 'text-muted-foreground'}>
                {(isActive ? '━' : '─').repeat(label.length)}
              </span>
              {i < TABS.length - 1 && '   '}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** Bottom hint bar — global app-level shortcuts, colored per <Button> variant
 *  in the upstream TUI: start=green, stop=yellow, restart/open=cyan,
 *  quit=red. */
export function ShellFooter() {
  return (
    <div className="font-mono">
      <Dim>1-8 tabs</Dim>
      <Dim> · </Dim>
      <Kbd> </Kbd> <Dim>cycle</Dim>
      <Dim> · </Dim>
      <Cyan>▸</Cyan> <Kbd tone={G}>^S</Kbd> <Green>start</Green>
      {'   '}
      <Kbd>^X</Kbd> <Yellow>stop</Yellow>
      {'   '}
      <Kbd>^R</Kbd> <Dim>restart</Dim>
      {'   '}
      <Kbd>^O</Kbd> <Dim>open</Dim>
      <Dim> · </Dim>
      <Kbd>?</Kbd> <Dim>help</Dim>
      <Dim> · </Dim>
      <Kbd tone={R}>q</Kbd> <Red>quit</Red>
    </div>
  );
}
