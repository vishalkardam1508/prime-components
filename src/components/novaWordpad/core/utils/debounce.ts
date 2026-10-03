export interface Debounced<TArgs extends unknown[]> {
  (...args: TArgs): void;
  cancel(): void;
  flush(): void;
}

/**
 * Returns a debounced version of `fn` that waits `wait` ms of silence
 * before invoking. Includes `.cancel()` and `.flush()` helpers.
 */
export function debounce<TArgs extends unknown[]>(fn: (...args: TArgs) => void, wait = 300): Debounced<TArgs> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: TArgs | null = null;

  const debounced = ((...args: TArgs): void => {
    lastArgs = args;
    if (timer != null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      if (lastArgs != null) fn(...lastArgs);
    }, wait);
  }) as Debounced<TArgs>;

  debounced.cancel = (): void => {
    if (timer != null) clearTimeout(timer);
    timer = null;
  };

  debounced.flush = (): void => {
    if (timer != null) {
      clearTimeout(timer);
      timer = null;
      if (lastArgs != null) fn(...lastArgs);
    }
  };

  return debounced;
}
