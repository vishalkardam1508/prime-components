import { useEffect, useRef, useState, type JSX } from 'react';
import clsx from 'clsx';
import { ChevronUpIcon, ChevronDownIcon } from '@/icons';

export function FlashPriceCell({ price }: { price: number }): JSX.Element {
  const prevRef = useRef(price);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (price > prevRef.current) setFlash('up');
    else if (price < prevRef.current) setFlash('down');
    prevRef.current = price;
    const t = setTimeout(() => setFlash(null), 700);
    return () => clearTimeout(t);
  }, [price]);

  return (
    <span
      className={clsx(
        'inline-block rounded px-1.5 py-0.5 font-semibold tabular-nums transition-colors duration-700',
        flash === 'up' && 'bg-emerald-400/25 text-emerald-300',
        flash === 'down' && 'bg-red-400/25 text-red-300',
        flash == null && 'text-slate-900 dark:text-white',
      )}
    >
      ${price.toFixed(2)}
    </span>
  );
}

export function ChangeCell({ change }: { change: number }): JSX.Element {
  const up = change >= 0;
  return (
    <span className={clsx('inline-flex items-center gap-0.5 font-medium tabular-nums', up ? 'text-emerald-400' : 'text-red-400')}>
      {up ? <ChevronUpIcon className="h-3 w-3" /> : <ChevronDownIcon className="h-3 w-3" />}
      {Math.abs(change).toFixed(2)}%
    </span>
  );
}

export function LiveIndicator({ intervalLabel }: { intervalLabel: string }): JSX.Element {
  return (
    <div className="flex items-center gap-1.5 px-4 pb-2 pt-3 text-[11px] font-medium text-emerald-400">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      Live — updates every {intervalLabel}
    </div>
  );
}
