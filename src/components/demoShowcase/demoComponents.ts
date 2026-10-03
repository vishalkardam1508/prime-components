import type { ComponentType } from 'react';
import { TableCellsIcon, BoltIcon, Square3Stack3DIcon, DocumentTextIcon } from '@/icons';

export type DemoAccent = 'cyan' | 'fuchsia' | 'emerald' | 'amber';
export type DemoStatus = 'stable' | 'beta';

export interface DemoComponentMeta {
  path: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  tags: string[];
  status: DemoStatus;
  accent: DemoAccent;
}

export const DEMO_COMPONENTS: DemoComponentMeta[] = [
  {
    path: '/demo/grid',
    title: 'DataGrid',
    shortTitle: 'DataGrid',
    description: 'Pagination-based data table powered by TanStack Table. Supports sorting, column filters, row selection, row expansion, and pinned columns.',
    icon: TableCellsIcon,
    tags: ['Pagination', 'Server-side', 'TanStack', 'Pinned Columns'],
    status: 'stable',
    accent: 'cyan',
  },
  {
    path: '/demo/vgrid',
    title: 'Virtual + Lazy Load DataGrid',
    shortTitle: 'Virtual Grid',
    description: 'Infinite scroll data grid built for 10K+ rows. Client-side filtering/sorting with virtual DOM rendering, plus a server mode for API-driven lazy loading.',
    icon: BoltIcon,
    tags: ['Infinite Scroll', 'Lazy Load', '10K+ Rows', 'Virtual DOM'],
    status: 'beta',
    accent: 'fuchsia',
  },
  {
    path: '/demo/excel',
    title: 'Nova Excel',
    shortTitle: 'Nova Excel',
    description: 'Full spreadsheet component with formula engine (SUM, AVERAGE, MIN, MAX), multi-sheet tabs, undo/redo, clipboard, column resize, and CSV import/export. Zero dependencies.',
    icon: Square3Stack3DIcon,
    tags: ['Formulas', 'Multi-Sheet', 'Undo/Redo', 'CSV', 'Zero Deps'],
    status: 'beta',
    accent: 'emerald',
  },
  {
    path: '/demo/wordpad',
    title: 'Nova WordPad',
    shortTitle: 'Nova WordPad',
    description: 'Full rich-text editor built on browser-native contenteditable — formatting, tables, images, links, undo/redo, and HTML/Markdown/TXT import-export. Zero dependencies.',
    icon: DocumentTextIcon,
    tags: ['Rich Text', 'Tables', 'Markdown', 'Undo/Redo', 'Zero Deps'],
    status: 'beta',
    accent: 'amber',
  },
];

export const DEMO_ACCENT: Record<DemoAccent, { iconBg: string; iconText: string; hoverBorder: string; hoverGlow: string; dot: string; activeTab: string }> = {
  cyan: {
    iconBg: 'bg-cyan-50 dark:bg-cyan-400/10',
    iconText: 'text-cyan-600 dark:text-cyan-400',
    hoverBorder: 'group-hover:border-cyan-400/50',
    hoverGlow: 'group-hover:shadow-md group-hover:shadow-cyan-500/15 dark:group-hover:shadow-[0_0_35px_-8px_rgba(34,211,238,0.55)]',
    dot: 'text-cyan-600 dark:text-cyan-400',
    activeTab: 'border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-400/50 dark:bg-cyan-400/10 dark:text-cyan-300 dark:shadow-[0_0_18px_-6px_rgba(34,211,238,0.6)]',
  },
  fuchsia: {
    iconBg: 'bg-fuchsia-50 dark:bg-fuchsia-400/10',
    iconText: 'text-fuchsia-600 dark:text-fuchsia-400',
    hoverBorder: 'group-hover:border-fuchsia-400/50',
    hoverGlow: 'group-hover:shadow-md group-hover:shadow-fuchsia-500/15 dark:group-hover:shadow-[0_0_35px_-8px_rgba(232,121,249,0.55)]',
    dot: 'text-fuchsia-600 dark:text-fuchsia-400',
    activeTab: 'border-fuchsia-300 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-400/50 dark:bg-fuchsia-400/10 dark:text-fuchsia-300 dark:shadow-[0_0_18px_-6px_rgba(232,121,249,0.6)]',
  },
  emerald: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-400/10',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    hoverBorder: 'group-hover:border-emerald-400/50',
    hoverGlow: 'group-hover:shadow-md group-hover:shadow-emerald-500/15 dark:group-hover:shadow-[0_0_35px_-8px_rgba(52,211,153,0.55)]',
    dot: 'text-emerald-600 dark:text-emerald-400',
    activeTab: 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-400/50 dark:bg-emerald-400/10 dark:text-emerald-300 dark:shadow-[0_0_18px_-6px_rgba(52,211,153,0.6)]',
  },
  amber: {
    iconBg: 'bg-amber-50 dark:bg-amber-400/10',
    iconText: 'text-amber-600 dark:text-amber-400',
    hoverBorder: 'group-hover:border-amber-400/50',
    hoverGlow: 'group-hover:shadow-md group-hover:shadow-amber-500/15 dark:group-hover:shadow-[0_0_35px_-8px_rgba(251,191,36,0.55)]',
    dot: 'text-amber-600 dark:text-amber-400',
    activeTab: 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-400/50 dark:bg-amber-400/10 dark:text-amber-300 dark:shadow-[0_0_18px_-6px_rgba(251,191,36,0.6)]',
  },
};
