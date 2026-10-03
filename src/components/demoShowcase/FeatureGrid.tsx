import type { ComponentType, JSX } from 'react';
import clsx from 'clsx';
import { DEMO_ACCENT, type DemoAccent } from './demoComponents';

export interface FeatureItem {
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

interface FeatureGridProps {
  features: FeatureItem[];
  accent: DemoAccent;
}

export function FeatureGrid({ features, accent }: FeatureGridProps): JSX.Element {
  const accentStyle = DEMO_ACCENT[accent];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {features.map((f) => (
        <div key={f.title} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <div className={clsx('mb-2 flex h-8 w-8 items-center justify-center rounded-lg', accentStyle.iconBg, accentStyle.iconText)}>
            <f.icon className="h-4 w-4" />
          </div>
          <h3 className="text-xs font-semibold text-slate-900 dark:text-white">{f.title}</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-white/50">{f.description}</p>
        </div>
      ))}
    </div>
  );
}
