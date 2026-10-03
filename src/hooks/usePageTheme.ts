import { useCallback, useEffect, useState } from 'react';

export type PageTheme = 'dark' | 'light';

const STORAGE_KEY = 'prime-components-page-theme';

function readStoredTheme(): PageTheme {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'light' ? 'light' : 'dark';
}

/**
 * Light/dark toggle for the landing page and demo pages (a Tailwind `dark:`
 * class toggle — see `@custom-variant dark` in `src/styles/index.css` —
 * separate from the app shell's own `--color-*` semantic theme system).
 * Persists to localStorage and stays in sync across tabs/pages via the
 * `storage` event, so switching on one page carries over on navigation.
 */
export function usePageTheme(): { theme: PageTheme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<PageTheme>(readStoredTheme);

  useEffect(() => {
    const onStorage = (e: StorageEvent): void => {
      if (e.key === STORAGE_KEY) setTheme(e.newValue === 'light' ? 'light' : 'dark');
    };
    window.addEventListener('storage', onStorage);
    return (): void => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
