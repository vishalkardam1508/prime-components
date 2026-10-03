import type { JSX, ReactNode } from 'react';
import clsx from 'clsx';

interface SelectionMarqueeFrameProps {
  children: ReactNode;
  className?: string;
  /** Adds a dashed vertical rule down the middle (for a two-column layout), touching the top/bottom rules. */
  centerDivider?: boolean;
}

/**
 * A dashed selection-box frame with small square handles at each corner, like a design-tool marquee.
 * The top/bottom rules bleed edge-to-edge across the viewport; the left/right sides stay bound to the content.
 */
export function SelectionMarqueeFrame({ children, className, centerDivider = false }: SelectionMarqueeFrameProps): JSX.Element {
  const handle = 'absolute h-2 w-2 bg-slate-400 dark:bg-white/70';

  return (
    <div className={clsx('relative rounded-none border-x border-dashed border-slate-300 dark:border-white/25', className)}>
      <div className="pointer-events-none absolute left-1/2 top-0 w-screen -translate-x-1/2 border-t border-dashed border-slate-300 dark:border-white/25" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 w-screen -translate-x-1/2 border-t border-dashed border-slate-300 dark:border-white/25" />
      {centerDivider && (
        <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 border-l border-dashed border-slate-300 dark:border-white/25 lg:block" />
      )}
      <span className={`${handle} -left-1 -top-1`} />
      <span className={`${handle} -right-1 -top-1`} />
      <span className={`${handle} -bottom-1 -left-1`} />
      <span className={`${handle} -bottom-1 -right-1`} />
      {children}
    </div>
  );
}
