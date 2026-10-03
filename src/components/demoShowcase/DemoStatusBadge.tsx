import type { JSX } from 'react';
import type { DemoStatus } from './demoComponents';

export function DemoStatusBadge({ status }: { status: DemoStatus }): JSX.Element {
  if (status === 'stable') {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
        Stable
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
      Beta
    </span>
  );
}
