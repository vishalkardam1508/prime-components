import { type JSX } from 'react';
import { NovaExcel } from '@/components/novaExcel';
import { DemoLayout } from '@/components/demoShowcase/DemoLayout';
import { DemoExampleSection } from '@/components/demoShowcase/DemoExampleSection';
import { FeatureGrid, type FeatureItem } from '@/components/demoShowcase/FeatureGrid';
import { TechBadges, type TechItem } from '@/components/demoShowcase/TechBadges';
import { DEMO_COMPONENTS } from '@/components/demoShowcase/demoComponents';
import {
  CodeBracketIcon,
  Square3Stack3DIcon,
  ArrowPathIcon,
  ArrowsPointingInIcon,
  CursorArrowRaysIcon,
  ArrowDownTrayIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
} from '@/icons';

const META = DEMO_COMPONENTS.find((d) => d.path === '/demo/excel')!;

const USAGE_CODE = `<NovaExcel
  rows={200}
  cols={30}
  initialSheets={[
    {
      name: 'Sales Data',
      cells: {
        r1c1: 'Product', r1c2: 'Q1', r1c3: 'Q2',
        r2c1: 'Widget A', r2c2: '1200', r2c3: '1500',
        r5c2: '=SUM(B2:B4)', r6c2: '=AVERAGE(B2:B4)',
      },
      colWidths: [100, 80, 80],
      frozenRows: 0,
      frozenCols: 0,
    },
  ]}
/>`;

const FEATURES: FeatureItem[] = [
  { icon: CodeBracketIcon, title: 'Formula engine', description: 'SUM, AVERAGE, MIN, MAX and more, recomputed live as cells change.' },
  { icon: Square3Stack3DIcon, title: 'Multi-sheet tabs', description: 'Add, rename, reorder, and delete sheets — each with its own data.' },
  { icon: ArrowPathIcon, title: 'Undo / redo', description: 'Full history stack for edits, formatting, merges, and structural changes.' },
  { icon: ArrowsPointingInIcon, title: 'Merge cells', description: 'Select a range, right-click, and merge — survives row/column inserts.' },
  { icon: CursorArrowRaysIcon, title: 'Drag & shift-select', description: 'Click-drag or Shift+Click to select ranges, just like Excel or Sheets.' },
  { icon: ArrowDownTrayIcon, title: 'CSV & XLSX import/export', description: 'Round-trip your data with standard spreadsheet file formats.' },
  { icon: ArrowsRightLeftIcon, title: 'Column resize', description: 'Drag to resize columns, capped between a sensible min and max width.' },
  { icon: ChartBarIcon, title: 'Live selection stats', description: 'Count, Sum, and Average for the current selection, right in the footer.' },
];

const TECH: TechItem[] = [
  { name: 'React', color: '#61DAFB' },
  { name: 'Next.js', color: '#FFFFFF' },
  { name: 'Angular', color: '#DD0031' },
  { name: 'HTML / Vanilla JS', color: '#E34F26' },
];

export function NovaExcelDemoPage(): JSX.Element {
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
          <NovaExcel
            rows={200}
            cols={30}
            initialSheets={[{
              name: 'Sales Data',
              cells: {
                r1c1: 'Product', r1c2: 'Q1', r1c3: 'Q2', r1c4: 'Q3', r1c5: 'Q4', r1c6: 'Total',
                r2c1: 'Widget A', r2c2: '1200', r2c3: '1500', r2c4: '1800', r2c5: '2100', r2c6: '=SUM(B2:E2)',
                r3c1: 'Widget B', r3c2: '800', r3c3: '950', r3c4: '1100', r3c5: '1300', r3c6: '=SUM(B3:E3)',
                r4c1: 'Widget C', r4c2: '2000', r4c3: '2200', r4c4: '2500', r4c5: '2800', r4c6: '=SUM(B4:E4)',
                r5c1: 'Total', r5c2: '=SUM(B2:B4)', r5c3: '=SUM(C2:C4)', r5c4: '=SUM(D2:D4)', r5c5: '=SUM(E2:E4)', r5c6: '=SUM(F2:F4)',
                r6c1: 'Average', r6c2: '=AVERAGE(B2:B4)', r6c3: '=AVERAGE(C2:C4)', r6c4: '=AVERAGE(D2:D4)', r6c5: '=AVERAGE(E2:E4)',
                r7c1: 'Max', r7c2: '=MAX(B2:B4)', r7c3: '=MAX(C2:C4)',
                r7c4: 'Min', r7c5: '=MIN(E2:E4)',
              },
              colWidths: [100, 80, 80, 80, 80, 90],
              rowHeights: [],
              styles: {},
              frozenRows: 0,
              frozenCols: 0,
            }, {
              name: 'Sheet 2',
              cells: { r1c1: 'Empty sheet — start typing!' },
              colWidths: [],
              rowHeights: [],
              styles: {},
              frozenRows: 0,
              frozenCols: 0,
            }]}
            maxHeight="calc(100vh - 260px)"
            className="!rounded-none"
          />
        </DemoExampleSection>

        <section className="flex flex-col gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Features</h2>
            <p className="text-xs text-slate-500 dark:text-white/50">Everything a full spreadsheet needs, built in-house with zero runtime dependencies.</p>
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
