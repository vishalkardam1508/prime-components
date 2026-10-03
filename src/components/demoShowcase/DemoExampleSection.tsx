import { useState, type JSX, type ReactNode } from 'react';
import clsx from 'clsx';
import { EyeIcon, CodeBracketIcon } from '@/icons';
import { CodeViewer } from './CodeViewer';
import type { DemoAccent } from './demoComponents';

interface DemoExampleSectionProps {
  step: number;
  title: string;
  description: string;
  accent: DemoAccent;
  code?: string;
  children: ReactNode;
  /** Skip the step badge + title + description strip (e.g. when a PageHeaderCard above already covers it) */
  hideHeader?: boolean;
}

const ACCENT_CARD: Record<DemoAccent, { border: string; badge: string; tabActive: string }> = {
  cyan: { border: 'border-cyan-400/15 hover:border-cyan-400/30', badge: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300', tabActive: 'border-cyan-500 text-cyan-700 dark:border-cyan-400 dark:text-cyan-300' },
  fuchsia: { border: 'border-fuchsia-400/15 hover:border-fuchsia-400/30', badge: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-400/15 dark:text-fuchsia-300', tabActive: 'border-fuchsia-500 text-fuchsia-700 dark:border-fuchsia-400 dark:text-fuchsia-300' },
  emerald: { border: 'border-emerald-400/15 hover:border-emerald-400/30', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300', tabActive: 'border-emerald-500 text-emerald-700 dark:border-emerald-400 dark:text-emerald-300' },
  amber: { border: 'border-amber-400/15 hover:border-amber-400/30', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300', tabActive: 'border-amber-500 text-amber-700 dark:border-amber-400 dark:text-amber-300' },
};

type Tab = 'preview' | 'usage';

export function DemoExampleSection({ step, title, description, accent, code, children, hideHeader = false }: DemoExampleSectionProps): JSX.Element {
  const [tab, setTab] = useState<Tab>('preview');
  const cardStyle = ACCENT_CARD[accent];
  const hasCode = code != null;

  return (
    <section className={clsx('overflow-hidden rounded-xl border bg-slate-50 transition-colors dark:bg-white/[0.04]', cardStyle.border)}>
      {/* Card header */}
      {!hideHeader && (
        <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-100/70 px-4 py-3 dark:border-white/10 dark:bg-white/[0.02]">
          <span className={clsx('flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold', cardStyle.badge)}>
            {step}
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h2>
            <p className="text-xs text-slate-500 dark:text-white/50">{description}</p>
          </div>
        </div>
      )}

      {/* Preview / Usage tabs */}
      {hasCode && (
        <div className="flex items-center gap-4 border-b border-slate-200 px-4 dark:border-white/10">
          <button
            type="button"
            onClick={() => setTab('preview')}
            className={clsx(
              'flex items-center gap-1.5 border-b-2 py-2.5 text-xs font-medium transition-colors',
              tab === 'preview' ? cardStyle.tabActive : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-white/45 dark:hover:text-white/80',
            )}
          >
            <EyeIcon className="h-3.5 w-3.5" />
            Preview
          </button>
          <button
            type="button"
            onClick={() => setTab('usage')}
            className={clsx(
              'flex items-center gap-1.5 border-b-2 py-2.5 text-xs font-medium transition-colors',
              tab === 'usage' ? cardStyle.tabActive : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-white/45 dark:hover:text-white/80',
            )}
          >
            <CodeBracketIcon className="h-3.5 w-3.5" />
            Usage
          </button>
        </div>
      )}

      {/* Live demo — kept mounted so its internal state survives tab switches */}
      <div className={clsx(hasCode && tab !== 'preview' && 'hidden')}>{children}</div>

      {/* Usage code */}
      {hasCode && tab === 'usage' && (
        <div className="p-0">
          <CodeViewer code={code} />
        </div>
      )}
    </section>
  );
}
