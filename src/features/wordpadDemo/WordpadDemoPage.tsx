import { type JSX } from 'react';
import { NovaWordpad } from '@/components/novaWordpad';
import { DemoLayout } from '@/components/demoShowcase/DemoLayout';
import { DemoExampleSection } from '@/components/demoShowcase/DemoExampleSection';
import { FeatureGrid, type FeatureItem } from '@/components/demoShowcase/FeatureGrid';
import { TechBadges, type TechItem } from '@/components/demoShowcase/TechBadges';
import { DEMO_COMPONENTS } from '@/components/demoShowcase/demoComponents';
import {
  PencilIcon,
  TableCellsIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  CursorArrowRaysIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ChartBarIcon,
} from '@/icons';

const META = DEMO_COMPONENTS.find((d) => d.path === '/demo/wordpad')!;

const USAGE_CODE = `import { NovaWordpad } from '@/components/novaWordpad';

<NovaWordpad initialHtml="<p>Start typing…</p>" />`;

const FEATURES: FeatureItem[] = [
  { icon: PencilIcon, title: 'Rich text formatting', description: 'Bold, italic, underline, strike, sub/superscript, colors, and highlight.' },
  { icon: DocumentTextIcon, title: 'Headings & paragraph styles', description: 'Headings, blockquotes, code blocks, alignment, and clear formatting.' },
  { icon: TableCellsIcon, title: 'Tables & images', description: 'Insert tables via a hover grid picker, plus images from file or URL.' },
  { icon: CursorArrowRaysIcon, title: 'Links & lists', description: 'Insert/edit/remove links, bullet & numbered lists, indent/outdent.' },
  { icon: ArrowPathIcon, title: 'Undo / redo', description: 'Full history stack for every edit, formatting change, and structural change.' },
  { icon: ArrowDownTrayIcon, title: 'HTML / Markdown / TXT import-export', description: 'Round-trip your document with a from-scratch Markdown lexer/parser.' },
  { icon: CodeBracketIcon, title: 'Uncontrolled editing surface', description: 'The contenteditable surface never re-renders on keystroke — stable caret, no jank.' },
  { icon: ChartBarIcon, title: 'Live word & character count', description: 'Status bar tracks words, characters, and current selection length.' },
];

const TECH: TechItem[] = [
  { name: 'React', color: '#61DAFB' },
  { name: 'Next.js', color: '#FFFFFF' },
  { name: 'Angular', color: '#DD0031' },
  { name: 'HTML / Vanilla JS', color: '#E34F26' },
];

export function WordpadDemoPage(): JSX.Element {
  return (
    <DemoLayout
      title={META.title}
      description={META.description}
      tags={META.tags}
      status={META.status}
      accent={META.accent}
      icon={META.icon}
    >
      <div className="flex flex-col gap-8 pb-8">
        <DemoExampleSection
          step={1}
          title={META.title}
          description={META.description}
          accent={META.accent}
          code={USAGE_CODE}
          hideHeader
        >
          <NovaWordpad
            initialHtml="<h1>Welcome to Nova WordPad</h1><p>A full rich-text editor built from scratch with React and browser-native APIs — no third-party editor, Markdown, or DOCX libraries.</p><p>Try <b>bold</b>, <i>italic</i>, <u>underline</u>, headings, lists, tables, links, and images from the toolbar above.</p>"
            className="!rounded-none"
          />
        </DemoExampleSection>

        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Features</h2>
            <p className="text-xs text-slate-500 dark:text-white/50">Everything a rich-text editor needs, built in-house with zero runtime dependencies.</p>
          </div>
          <FeatureGrid features={FEATURES} accent={META.accent} />
        </section>

        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Works with your stack</h2>
            <p className="text-xs text-slate-500 dark:text-white/50">Plain React components — drop them into any framework that renders React.</p>
          </div>
          <TechBadges items={TECH} />
        </section>
      </div>
    </DemoLayout>
  );
}
