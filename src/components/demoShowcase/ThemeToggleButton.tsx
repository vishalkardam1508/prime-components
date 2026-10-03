import type { JSX } from 'react';
import type { PageTheme } from '@/hooks/usePageTheme';

interface ThemeToggleButtonProps {
  theme: PageTheme;
  onToggle: () => void;
}

/** Light/dark toggle shared by the landing page and every demo page's nav. */
export function ThemeToggleButton({ theme, onToggle }: ThemeToggleButtonProps): JSX.Element {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:text-white/60 dark:hover:border-white/20 dark:hover:text-white"
    >
      {isDark ? (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <path
            d="M17 10.8A7.2 7.2 0 0 1 8.2 2a7.2 7.2 0 1 0 8.8 8.8Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
          <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M10 1.7v2M10 16.3v2M18.3 10h-2M3.7 10h-2M15.6 4.4l-1.4 1.4M5.8 14.2l-1.4 1.4M15.6 15.6l-1.4-1.4M5.8 5.8 4.4 4.4"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}
