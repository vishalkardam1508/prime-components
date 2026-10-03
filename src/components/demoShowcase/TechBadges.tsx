import type { JSX } from 'react';

export interface TechItem {
  name: string;
  color: string;
}

interface TechBadgesProps {
  items: TechItem[];
}

export function TechBadges({ items }: TechBadgesProps): JSX.Element {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t) => (
        <span
          key={t.name}
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-white/80"
        >
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: t.color }} />
          {t.name}
        </span>
      ))}
    </div>
  );
}
