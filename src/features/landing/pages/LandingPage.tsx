import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { SparklesIcon, ChevronRightIcon, TableCellsIcon, BoltIcon, Square3Stack3DIcon, DocumentTextIcon, EnvelopeIcon, PhoneIcon, GlobeAltIcon } from '@/icons';
import { DEMO_COMPONENTS, DEMO_ACCENT } from '@/components/demoShowcase/demoComponents';
import { DemoStatusBadge } from '@/components/demoShowcase/DemoStatusBadge';
import { AnimatedGridPreview } from '@/components/demoShowcase/AnimatedGridPreview';
import { AnimatedExcelPreview } from '@/components/demoShowcase/AnimatedExcelPreview';
import { AnimatedWordpadPreview } from '@/components/demoShowcase/AnimatedWordpadPreview';
import { SelectionMarqueeFrame } from '@/components/demoShowcase/SelectionMarqueeFrame';
import { ThemeToggleButton } from '@/components/demoShowcase/ThemeToggleButton';
import { usePageTheme } from '@/hooks/usePageTheme';
import { LogoMarquee } from '../components/LogoMarquee';

export function LandingPage(): JSX.Element {
  const { theme, toggleTheme } = usePageTheme();

  return (
    <div className={clsx(theme === 'dark' && 'dark')}>
      <div className="relative min-h-screen overflow-hidden bg-white text-slate-900 transition-colors dark:bg-[#05050a] dark:text-white">
        {/* Neon ambient glow blobs — dark theme only */}
        <div className="pointer-events-none absolute -top-32 left-1/4 hidden h-96 w-96 rounded-full bg-cyan-500/25 blur-[120px] dark:block" />
        <div className="pointer-events-none absolute top-40 right-0 hidden h-96 w-96 rounded-full bg-fuchsia-500/20 blur-[120px] dark:block" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 hidden h-96 w-96 rounded-full bg-emerald-500/15 blur-[120px] dark:block" />

        <div className="relative">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-white/10 dark:bg-black/50">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
              <div className="flex items-center gap-2.5">
                <img src="/prime-favicon.svg" alt="" className="h-6 w-6" />
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Prime Components</span>
              </div>
              <nav className="flex items-center gap-6">
                <a href="#components" className="text-sm font-medium text-slate-500 transition-colors hover:text-cyan-500 dark:text-white/60 dark:hover:text-cyan-400">
                  Components
                </a>
                <ThemeToggleButton theme={theme} onToggle={toggleTheme} />
                <Link
                  to="/demo/grid"
                  className="inline-flex items-center gap-1 rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-black shadow-md shadow-cyan-500/20 transition-shadow hover:shadow-lg hover:shadow-cyan-500/30 dark:shadow-[0_0_20px_-4px_rgba(34,211,238,0.7)] dark:hover:shadow-[0_0_28px_-4px_rgba(34,211,238,0.9)]"
                >
                  Get Started
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </nav>
            </div>
          </header>

        {/* Hero */}
        <section className="border-b border-slate-200 dark:border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 py-24 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 text-[11px] font-medium text-cyan-700 shadow-sm dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300 dark:shadow-[0_0_20px_-6px_rgba(34,211,238,0.6)]">
              <SparklesIcon className="h-3.5 w-3.5" />
              Built in-house · Zero external grid deps
            </span>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
              Data-grade UI components,{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent">
                built for scale
              </span>
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-slate-500 dark:text-white/60">
              Three grid engines, one toolkit: a server-driven DataGrid, a virtualized DataGrid for
              massive datasets, and a full spreadsheet with formulas. Pick the one that fits your data.
            </p>
            <div className="mt-2 flex items-center gap-3">
              <a
                href="#components"
                className="inline-flex items-center gap-1.5 rounded-md bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-black shadow-md shadow-cyan-500/25 transition-shadow hover:shadow-lg hover:shadow-cyan-500/35 dark:shadow-[0_0_25px_-5px_rgba(34,211,238,0.8)] dark:hover:shadow-[0_0_35px_-5px_rgba(34,211,238,1)]"
              >
                Explore Components
                <ChevronRightIcon className="h-4 w-4" />
              </a>
              <Link
                to="/demo/excel"
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-900 transition-all hover:border-emerald-400/50 hover:shadow-md dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:shadow-[0_0_25px_-8px_rgba(52,211,153,0.6)]"
              >
                Try Nova Excel
              </Link>
            </div>
          </div>
        </section>

        {/* Trusted-by logo marquee */}
        <section className="border-b border-slate-200 py-10 dark:border-white/10">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-white/40">
            Trusted by teams at
          </p>
          <LogoMarquee />
        </section>

        {/* Live previews — both grids, self-running, always on */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-14 flex flex-col items-center gap-2 text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">See our core innovations</h2>
            <p className="max-w-xl text-sm text-slate-500 dark:text-white/50">Live, self-running previews — no clicks needed.</p>
          </div>

          {/* DataGrid — info left, preview right — one connected selection box */}
          <SelectionMarqueeFrame centerDivider>
            <div className="grid grid-cols-1 items-stretch lg:grid-cols-2">
              <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-cyan-300 bg-cyan-50 px-3 py-1 text-[11px] font-medium text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-300">
                  <TableCellsIcon className="h-3.5 w-3.5" />
                  DataGrid
                </span>
                <h3 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">The pagination grid, perfected.</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-white/60">
                  Server-driven pages, instant sorting, and per-column filters — powered by TanStack Table, tuned for production.
                </p>
                <Link
                  to="/demo/grid"
                  className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-md bg-cyan-400 px-4 py-2 text-sm font-semibold text-black shadow-md shadow-cyan-500/20 transition-shadow hover:shadow-lg hover:shadow-cyan-500/30 dark:shadow-[0_0_20px_-4px_rgba(34,211,238,0.7)] dark:hover:shadow-[0_0_28px_-4px_rgba(34,211,238,0.9)]"
                >
                  See more
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>
              <div className="flex h-full items-center">
                <AnimatedGridPreview mode="pagination" accent="cyan" className="w-full" />
              </div>
            </div>
          </SelectionMarqueeFrame>

          {/* Virtual Grid — preview left, info right (mirrored) — one connected selection box */}
          <SelectionMarqueeFrame centerDivider>
            <div className="grid grid-cols-1 items-stretch lg:grid-cols-2">
              <div className="order-2 flex h-full items-center lg:order-1">
                <AnimatedGridPreview mode="infinite" accent="fuchsia" className="w-full" />
              </div>
              <div className="order-1 flex flex-col justify-center gap-4 p-6 sm:p-8 lg:order-2 lg:p-10">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-fuchsia-300 bg-fuchsia-50 px-3 py-1 text-[11px] font-medium text-fuchsia-700 dark:border-fuchsia-400/30 dark:bg-fuchsia-400/10 dark:text-fuchsia-300">
                  <BoltIcon className="h-3.5 w-3.5" />
                  Virtual + Lazy Load DataGrid
                </span>
                <h3 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">Stop using old-style grids and pagination.</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-white/60">
                  No repeated server calls. No page reloads. No disruption — just smooth, infinite scroll through 10,000+ rows.
                </p>
                <Link
                  to="/demo/vgrid"
                  className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-md bg-fuchsia-400 px-4 py-2 text-sm font-semibold text-black shadow-md shadow-fuchsia-500/20 transition-shadow hover:shadow-lg hover:shadow-fuchsia-500/30 dark:shadow-[0_0_20px_-4px_rgba(232,121,249,0.7)] dark:hover:shadow-[0_0_28px_-4px_rgba(232,121,249,0.9)]"
                >
                  See more
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </SelectionMarqueeFrame>

          {/* Nova Excel — info left, preview right — one connected selection box */}
          <SelectionMarqueeFrame centerDivider>
            <div className="grid grid-cols-1 items-stretch lg:grid-cols-2">
              <div className="flex flex-col justify-center gap-4 p-6 sm:p-8 lg:p-10">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <Square3Stack3DIcon className="h-3.5 w-3.5" />
                  Nova Excel
                </span>
                <h3 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">Excel-grade power, zero dependencies.</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-white/60">
                  A real formula engine, multi-sheet tabs, undo/redo, and CSV import/export — built from scratch, no libraries required.
                </p>
                <Link
                  to="/demo/excel"
                  className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-black shadow-md shadow-emerald-500/20 transition-shadow hover:shadow-lg hover:shadow-emerald-500/30 dark:shadow-[0_0_20px_-4px_rgba(52,211,153,0.7)] dark:hover:shadow-[0_0_28px_-4px_rgba(52,211,153,0.9)]"
                >
                  See more
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>
              <div className="flex h-full items-center">
                <AnimatedExcelPreview className="w-full" />
              </div>
            </div>
          </SelectionMarqueeFrame>

          {/* Nova WordPad — preview left, info right (mirrored) — one connected selection box */}
          <SelectionMarqueeFrame centerDivider>
            <div className="grid grid-cols-1 items-stretch lg:grid-cols-2">
              <div className="order-2 flex h-full items-center lg:order-1">
                <AnimatedWordpadPreview className="w-full" />
              </div>
              <div className="order-1 flex flex-col justify-center gap-4 p-6 sm:p-8 lg:order-2 lg:p-10">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300">
                  <DocumentTextIcon className="h-3.5 w-3.5" />
                  Nova WordPad
                </span>
                <h3 className="text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">A real rich-text editor, not a textarea.</h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-white/60">
                  Formatting, tables, images, links, and undo/redo on a stable, uncontrolled editing surface — with HTML, Markdown, and TXT import/export built in.
                </p>
                <Link
                  to="/demo/wordpad"
                  className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-md bg-amber-400 px-4 py-2 text-sm font-semibold text-black shadow-md shadow-amber-500/20 transition-shadow hover:shadow-lg hover:shadow-amber-500/30 dark:shadow-[0_0_20px_-4px_rgba(251,191,36,0.7)] dark:hover:shadow-[0_0_28px_-4px_rgba(251,191,36,0.9)]"
                >
                  See more
                  <ChevronRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </SelectionMarqueeFrame>
        </section>

        {/* Components */}
        <section id="components" className="mx-auto max-w-6xl scroll-mt-20 px-6 py-16">
          <div className="mb-10 flex flex-col items-center gap-2 text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white">Explore the components</h2>
            <p className="max-w-xl text-sm text-slate-500 dark:text-white/50">
              Click any card to open a live, interactive demo.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {DEMO_COMPONENTS.map((component) => {
              const accent = DEMO_ACCENT[component.accent];
              return (
                <Link
                  key={component.path}
                  to={component.path}
                  className={`group flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-6 transition-all hover:-translate-y-0.5 dark:border-white/10 dark:bg-white/5 ${accent.hoverBorder} ${accent.hoverGlow}`}
                >
                  {/* Icon + Status */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${accent.iconBg} ${accent.iconText}`}>
                      <component.icon className="h-5 w-5" />
                    </div>
                    <DemoStatusBadge status={component.status} />
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    {component.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500 dark:text-white/50">
                    {component.description}
                  </p>

                  {/* Tags */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {component.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-white/10 dark:text-white/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer arrow */}
                  <div className={`mt-5 flex items-center gap-1 text-sm font-medium opacity-0 transition-opacity group-hover:opacity-100 ${accent.dot}`}>
                    View Demo
                    <ChevronRightIcon className="h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10 text-center">
            <div className="flex items-center gap-2">
              <img src="/prime-favicon.svg" alt="" className="h-5 w-5" />
              <span className="text-xs font-semibold text-slate-900 dark:text-white">Prime Components</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-white/40">Internal UI components — DataGrid, Virtual + Lazy Load DataGrid, Nova Excel.</p>

            <div className="flex flex-col items-center gap-3 border-t border-slate-200 pt-6 dark:border-white/10">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-white/40">
                For contact or enquiry, connect with
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                <a
                  href="mailto:vishalkardam2000@gmail.com"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-cyan-600 dark:text-white/70 dark:hover:text-cyan-300"
                >
                  <EnvelopeIcon className="h-3.5 w-3.5" />
                  vishalkardam2000@gmail.com
                </a>
                <a
                  href="tel:+919027474653"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-cyan-600 dark:text-white/70 dark:hover:text-cyan-300"
                >
                  <PhoneIcon className="h-3.5 w-3.5" />
                  +91-9027474653
                </a>
                <a
                  href="https://vishalkardam.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-cyan-600 dark:text-white/70 dark:hover:text-cyan-300"
                >
                  <GlobeAltIcon className="h-3.5 w-3.5" />
                  vishalkardam.vercel.app
                </a>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-white/30">
              Created by <span className="font-medium text-slate-500 dark:text-white/50">Vishal Kardam</span> · © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </footer>
      </div>
      </div>
    </div>
  );
}
