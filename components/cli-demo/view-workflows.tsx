'use client';

import { cn } from '@/lib/utils';
import { B, DIM, Dim } from './colors';

export function WorkflowsView() {
  return (
    <div className="font-mono">
      <div className="mb-2">
        <B>Workflows</B> <Dim>· 2 total</Dim>
      </div>
      <div>
        ▸ <B>nightly-deploy</B> <Dim>idle</Dim>
      </div>
      <div>
        ▸ <B>morning-routine</B> <Dim>idle</Dim>
      </div>
      <div className={DIM}>· legacy-cron disabled</div>
      <div className={cn('mt-3', DIM)}>(enter inspect, r retry — coming soon)</div>
    </div>
  );
}
