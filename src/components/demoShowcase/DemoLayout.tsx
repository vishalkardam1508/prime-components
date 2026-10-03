import type { JSX, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { usePageTheme } from '@/hooks/usePageTheme';
import { DEMO_COMPONENTS, DEMO_ACCENT, type DemoAccent, type DemoStatus } from './demoComponents';
import { PageHeaderCard } from './PageHeaderCard';
import { ThemeToggleButton } from './ThemeToggleButton';

interface DemoLayoutProps {
  title: string;
  description: string;
  tags: string[];
  status: DemoStatus;
  accent: DemoAccent;
  icon: React.ComponentType<{ className?: string }>;
  children: ReactNode;
}

export function DemoLayout({ title, description, tags, status, accent, icon: Icon, children }: DemoLayoutProps): JSX.Element {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = usePageTheme();

  return (
    <div className={clsx(theme === 'dark' && 'dark')}>
      <div className="relative flex h-screen flex-col overflow-hidden bg-white text-slate-900 transition-colors dark:bg-[#05050a] dark:text-white">
        {/* Ambient glow — dark theme only */}
        <div className="pointer-events-none fixed -top-32 left-1/4 hidden h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] dark:block" />
        <div className="pointer-events-none fixed top-40 right-0 hidden h-96 w-96 rounded-full bg-fuchsia-500/10 blur-[120px] dark:block" />

        {/* Top nav */}
        <header className="relative z-10 shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-black/50">
          <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6">
            <Link to="/" className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900 transition-colors hover:text-cyan-500 dark:text-white dark:hover:text-cyan-300">
              <img src="/prime-favicon.svg" alt="" className="h-6 w-6" />
              Prime Components
            </Link>
            <nav className="flex items-center gap-1.5">
              {DEMO_COMPONENTS.map((demo) => {
                const active = pathname === demo.path;
                const demoAccent = DEMO_ACCENT[demo.accent];
                return (
                  <Link
                    key={demo.path}
                    to={demo.path}
                    className={clsx(
                      'rounded-md border border-transparent px-3 py-1.5 text-xs font-medium transition-all',
                      active ? demoAccent.activeTab : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white',
                    )}
                  >
                    {demo.shortTitle}
                  </Link>
                );
              })}
              <ThemeToggleButton theme={theme} onToggle={toggleTheme} />
            </nav>
          </div>
        </header>

        {/* Content — overflow-anchor disabled: heavy children (e.g. NovaExcel) can resize
            below the fold shortly after mount, and Chrome's scroll anchoring would silently
            scroll this container to compensate, hiding the header above the fold. */}
        <div className="relative z-10 min-h-0 flex-1 overflow-auto px-6 py-5 [overflow-anchor:none]">
          <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
            <PageHeaderCard title={title} description={description} tags={tags} status={status} accent={accent} icon={Icon} />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
