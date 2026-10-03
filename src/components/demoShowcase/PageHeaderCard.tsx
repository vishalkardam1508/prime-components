import type { JSX } from 'react';
import clsx from 'clsx';
import { DEMO_ACCENT, type DemoAccent, type DemoStatus } from './demoComponents';
import { DemoStatusBadge } from './DemoStatusBadge';

interface PageHeaderCardProps {
  title: string;
  description: string;
  tags: string[];
  status: DemoStatus;
  accent: DemoAccent;
  icon: React.ComponentType<{ className?: string }>;
}

const ACCENT_CARD: Record<DemoAccent, { border: string; glow: string; blob: string }> = {
  cyan: {
    border: 'border-cyan-400/20',
    glow: 'shadow-sm dark:shadow-[0_0_50px_-15px_rgba(34,211,238,0.35)]',
    blob: 'bg-cyan-500/20',
  },
  fuchsia: {
    border: 'border-fuchsia-400/20',
    glow: 'shadow-sm dark:shadow-[0_0_50px_-15px_rgba(232,121,249,0.35)]',
    blob: 'bg-fuchsia-500/20',
  },
  emerald: {
    border: 'border-emerald-400/20',
    glow: 'shadow-sm dark:shadow-[0_0_50px_-15px_rgba(52,211,153,0.35)]',
    blob: 'bg-emerald-500/20',
  },
  amber: {
    border: 'border-amber-400/20',
    glow: 'shadow-sm dark:shadow-[0_0_50px_-15px_rgba(251,191,36,0.35)]',
    blob: 'bg-amber-500/20',
  },
};

export function PageHeaderCard({ title, description, tags, status, accent, icon: Icon }: PageHeaderCardProps): JSX.Element {
  const accentStyle = DEMO_ACCENT[accent];
  const cardStyle = ACCENT_CARD[accent];

  return (
    <div className={clsx('relative overflow-hidden rounded-2xl border bg-slate-50 p-5 dark:bg-white/[0.03]', cardStyle.border, cardStyle.glow)}>
      <div className={clsx('pointer-events-none absolute -right-10 -top-16 hidden h-48 w-48 rounded-full blur-[80px] dark:block', cardStyle.blob)} />

      <div className="relative flex items-start gap-4">
        <div className={clsx('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', accentStyle.iconBg, accentStyle.iconText)}>
          <Icon className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h1>
            <DemoStatusBadge status={status} />
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-white/60">{description}</p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-white/10 dark:text-white/60">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
