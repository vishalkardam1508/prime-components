import { useState, type JSX } from 'react';
import { VGrid } from '@/components/vGrid';
import type { VGridColumn } from '@/components/vGrid/types/vGrid.types';
import clsx from 'clsx';
import { DemoLayout } from '@/components/demoShowcase/DemoLayout';
import { DemoExampleSection } from '@/components/demoShowcase/DemoExampleSection';
import { DEMO_COMPONENTS } from '@/components/demoShowcase/demoComponents';
import { useLiveStockData, type StockRow } from '@/components/demoShowcase/liveStockData';
import { FlashPriceCell, ChangeCell, LiveIndicator } from '@/components/demoShowcase/StockCells';

const META = DEMO_COMPONENTS.find((d) => d.path === '/demo/vgrid')!;

type Status = 'Active' | 'Inactive' | 'Pending';

interface Person {
  id: number;
  name: string;
  email: string;
  city: string;
  country: string;
  company: string;
  role: string;
  salary: number;
  joined: string;
  score: number;
  status: Status;
  dept: string;
  region: string;
}

const CITIES = ['New York', 'London', 'Berlin', 'Tokyo', 'Sydney', 'Toronto', 'Paris', 'Dubai', 'Singapore', 'Mumbai'];
const COUNTRIES = ['USA', 'UK', 'Germany', 'Japan', 'Australia', 'Canada', 'France', 'UAE', 'Singapore', 'India'];
const COMPANIES = ['Acme Corp', 'Nebula Inc', 'Vertex Systems', 'Orbit Labs', 'Fusion Co', 'Axiom Ltd', 'Pulse AI', 'Zeta Works'];
const ROLES = ['Developer', 'Designer', 'Analyst', 'Manager', 'Engineer', 'Architect', 'Lead', 'Director'];
const STATUSES: Status[] = ['Active', 'Inactive', 'Pending'];
const DEPTS = ['Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Finance', 'Operations', 'Legal'];
const REGIONS = ['APAC', 'EMEA', 'AMER', 'LATAM'];
const DATES = ['2021-03-12', '2022-07-01', '2020-11-20', '2023-01-15', '2022-04-08', '2021-09-30', '2023-06-22', '2020-05-05', '2024-02-18', '2023-11-09'];

let _seed = 7;
const rand = (): number => { _seed = (_seed * 1664525 + 1013904223) & 0xffffffff; return (_seed >>> 0) / 0xffffffff; };
const pickS = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]!;
const randInt = (min: number, max: number): number => Math.floor(rand() * (max - min + 1)) + min;

const ALL_DATA: Person[] = Array.from({ length: 10000 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  city: pickS(CITIES),
  country: pickS(COUNTRIES),
  company: pickS(COMPANIES),
  role: pickS(ROLES),
  salary: randInt(30000, 150000),
  joined: pickS(DATES),
  score: randInt(1, 100),
  status: pickS(STATUSES),
  dept: pickS(DEPTS),
  region: pickS(REGIONS),
}));

const statusStyles: Record<Status, string> = {
  Active: 'bg-success/10 text-success border border-success/20',
  Inactive: 'bg-error/10 text-error border border-error/20',
  Pending: 'bg-warning/10 text-warning-text border border-warning/20',
};

const COLUMNS: VGridColumn<Person>[] = [
  { field: 'id', header: 'ID', width: 60, frozen: true, sortable: true, filter: true, filterType: 'number', align: 'right' },
  { field: 'name', header: 'Name', width: 160, frozen: true, sortable: true, filter: true, filterType: 'text' },
  { field: 'email', header: 'Email', width: 200, frozen: true, sortable: true, filter: true, filterType: 'text' },
  { field: 'city', header: 'City', width: 130, sortable: true, filter: true, filterType: 'text' },
  { field: 'country', header: 'Country', width: 110, sortable: true, filter: true, filterType: 'text' },
  { field: 'company', header: 'Company', width: 150, sortable: true, filter: true, filterType: 'text' },
  { field: 'role', header: 'Role', width: 120, sortable: true, filter: true, filterType: 'text' },
  {
    field: 'salary', header: 'Salary', width: 110, sortable: true, filter: true, filterType: 'number', align: 'right',
    body: ({ value }) => <span className="tabular-nums font-medium">${(value as number).toLocaleString()}</span>,
  },
  { field: 'joined', header: 'Joined', width: 120, sortable: true, filter: true, filterType: 'date' },
  {
    field: 'score', header: 'Score', width: 80, sortable: true, filter: true, filterType: 'number', align: 'right',
    body: ({ value }) => {
      const s = value as number;
      return <span className={clsx('font-semibold tabular-nums', s >= 80 ? 'text-success' : s >= 50 ? 'text-warning-text' : 'text-error')}>{s}</span>;
    },
  },
  {
    field: 'status', header: 'Status', width: 100, sortable: true, filter: true, filterType: 'text', align: 'center',
    body: ({ value }) => (
      <span className={clsx('inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium', statusStyles[value as Status])}>
        {value as string}
      </span>
    ),
  },
  { field: 'dept', header: 'Department', width: 130, sortable: true, filter: true, filterType: 'text' },
  { field: 'region', header: 'Region', width: 90, sortable: true, filter: true, filterType: 'text' },
];

/* Reduced column sets used by the simpler progressive examples */
const SIMPLE_COLUMNS: VGridColumn<Person>[] = COLUMNS.filter((col) =>
  ['id', 'name', 'email', 'city'].includes(col.field)
).map((col) => ({ ...col, sortable: false, filter: false }));

const SELECTION_COLUMNS: VGridColumn<Person>[] = COLUMNS.filter((col) =>
  ['id', 'name', 'email', 'role', 'status'].includes(col.field)
).map((col) => ({ ...col, sortable: false, filter: false }));

const SAMPLE_DATA = ALL_DATA.slice(0, 200);

const STOCK_COLUMNS: VGridColumn<StockRow>[] = [
  { field: 'symbol', header: 'Symbol', width: 90, frozen: true, body: ({ value }) => <span className="font-bold text-white">{value as string}</span> },
  { field: 'name', header: 'Company', width: 200 },
  { field: 'sector', header: 'Sector', width: 150 },
  { field: 'price', header: 'Price', width: 110, align: 'right', body: ({ value }) => <FlashPriceCell price={value as number} /> },
  { field: 'change', header: 'Change', width: 110, align: 'right', body: ({ value }) => <ChangeCell change={value as number} /> },
  {
    field: 'volume', header: 'Volume', width: 120, align: 'right',
    body: ({ value }) => <span className="tabular-nums text-white/70">{(value as number).toLocaleString()}</span>,
  },
];

const SIMPLE_CODE = `<VGrid
  data={data}
  columns={columns}
  rowKey="id"
  totalRecords={data.length}
/>`;

const SELECTION_CODE = `<VGrid
  data={data}
  columns={columns}
  rowKey="id"
  totalRecords={data.length}
  selectionMode="multiple"
  selection={selection}
  onSelectionChange={setSelection}
  showSelectAll
/>`;

const FULL_CODE = `<VGrid
  data={data}
  columns={columns}
  rowKey="id"
  totalRecords={totalRecords}
  clientFilter
  selectionMode="multiple"
  selection={selection}
  onSelectionChange={setSelection}
  showSelectAll
  onExportExcel={exportExcel}
  onExportPdf={exportPdf}
  renderExpandedRow={(row) => <RowDetail row={row} />}
/>`;

const STOCK_CODE = `const stocks = useLiveStockData(1500); // ticks every 1.5s

<VGrid
  data={stocks}
  columns={columns}
  rowKey="id"
  totalRecords={stocks.length}
/>`;

export function VGridDemoPage(): JSX.Element {
  const [data] = useState<Person[]>(ALL_DATA);
  const [checkedRows, setCheckedRows] = useState<Person[]>([]);
  const [selection, setSelection] = useState<Person[]>([]);
  const stocks = useLiveStockData(1500);

  const totalRecords = ALL_DATA.length;

  return (
    <DemoLayout
      title={META.title}
      description={`${META.description} · ${totalRecords} total, ${data.length} loaded`}
      tags={META.tags}
      status={META.status}
      accent={META.accent}
      icon={META.icon}
    >
      <div className="flex flex-col gap-8 pb-8">
        <DemoExampleSection
          step={1}
          title="Simple grid"
          description="Just data + columns — no sorting, filters, or selection."
          accent={META.accent}
          code={SIMPLE_CODE}
        >
          <VGrid<Person>
            data={SAMPLE_DATA}
            columns={SIMPLE_COLUMNS}
            rowKey="id"
            totalRecords={SAMPLE_DATA.length}
            maxHeight="360px"
            className="!rounded-none"
          />
        </DemoExampleSection>

        <DemoExampleSection
          step={2}
          title="With row selection"
          description="Adds checkboxes for single/multi row selection."
          accent={META.accent}
          code={SELECTION_CODE}
        >
          <VGrid<Person>
            data={SAMPLE_DATA}
            columns={SELECTION_COLUMNS}
            rowKey="id"
            totalRecords={SAMPLE_DATA.length}
            selectionMode="multiple"
            selection={checkedRows}
            onSelectionChange={setCheckedRows}
            showSelectAll
            maxHeight="360px"
            className="!rounded-none"
          />
        </DemoExampleSection>

        <DemoExampleSection
          step={3}
          title="Full configuration"
          description="10K+ rows with virtualized infinite scroll, sorting, filters, selection, row expansion, and export."
          accent={META.accent}
          code={FULL_CODE}
        >
          <VGrid<Person>
            data={data}
            columns={COLUMNS}
            rowKey="id"
            totalRecords={totalRecords}
            clientFilter
            selectionMode="multiple"
            selection={selection}
            onSelectionChange={setSelection}
            showSelectAll
            onExportExcel={() => void 0}
            onExportPdf={() => void 0}
            renderExpandedRow={(row) => (
              <div className="flex flex-wrap gap-3 p-3 bg-surface-muted/60">
                <div className="min-w-[150px] rounded-md border border-border bg-surface px-3 py-2">
                  <strong className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-primary">Contact</strong>
                  <p className="text-[11px] leading-relaxed text-text-muted">
                    {row.email}<br />{row.city}, {row.country}
                  </p>
                </div>
                <div className="min-w-[150px] rounded-md border border-border bg-surface px-3 py-2">
                  <strong className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-primary">Company</strong>
                  <p className="text-[11px] leading-relaxed text-text-muted">
                    {row.company}<br />{row.dept}<br />{row.role}
                  </p>
                </div>
                <div className="min-w-[150px] rounded-md border border-border bg-surface px-3 py-2">
                  <strong className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-primary">Stats</strong>
                  <p className="text-[11px] leading-relaxed text-text-muted">
                    Salary: ${row.salary.toLocaleString()}<br />Score: {row.score}<br />Region: {row.region}
                  </p>
                </div>
              </div>
            )}
            className="!rounded-none"
          />
        </DemoExampleSection>

        <DemoExampleSection
          step={4}
          title="Real-time updates"
          description="Simulated stock ticker — prices refresh every 1.5s with flash-on-change highlighting."
          accent={META.accent}
          code={STOCK_CODE}
        >
          <LiveIndicator intervalLabel="1.5s" />
          <VGrid<StockRow>
            data={stocks}
            columns={STOCK_COLUMNS}
            rowKey="id"
            totalRecords={stocks.length}
            maxHeight="420px"
            className="!rounded-none"
          />
        </DemoExampleSection>
      </div>
    </DemoLayout>
  );
}
