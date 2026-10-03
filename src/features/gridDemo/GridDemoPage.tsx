import { useState, useMemo, type JSX } from 'react';
import { DataGrid } from '@/components/datagrid/DataGrid';
import { createInitialGridState } from '@/components/datagrid/types/grid.state';
import type { GridColumnDef } from '@/components/datagrid/types/grid.types';
import type { GridState } from '@/components/datagrid/types/grid.state';
import type { GridColumnFilterValue } from '@/components/datagrid/types/grid.filters';
import type { Row } from '@tanstack/react-table';
import clsx from 'clsx';
import { DemoLayout } from '@/components/demoShowcase/DemoLayout';
import { DemoExampleSection } from '@/components/demoShowcase/DemoExampleSection';
import { DEMO_COMPONENTS } from '@/components/demoShowcase/demoComponents';
import { useLiveStockData, type StockRow } from '@/components/demoShowcase/liveStockData';
import { FlashPriceCell, ChangeCell, LiveIndicator } from '@/components/demoShowcase/StockCells';

const META = DEMO_COMPONENTS.find((d) => d.path === '/demo/grid')!;

/* ─────────────────────────────────────────────
   DATA TYPES
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   DUMMY DATA (120 rows)
───────────────────────────────────────────── */
const CITIES = [
  'New York',
  'London',
  'Berlin',
  'Tokyo',
  'Sydney',
  'Toronto',
  'Paris',
  'Dubai',
  'Singapore',
  'Mumbai',
];
const COUNTRIES = [
  'USA',
  'UK',
  'Germany',
  'Japan',
  'Australia',
  'Canada',
  'France',
  'UAE',
  'Singapore',
  'India',
];
const COMPANIES = [
  'Acme Corp',
  'Nebula Inc',
  'Vertex Systems',
  'Orbit Labs',
  'Fusion Co',
  'Axiom Ltd',
  'Pulse AI',
  'Zeta Works',
];
const ROLES = [
  'Developer',
  'Designer',
  'Analyst',
  'Manager',
  'Engineer',
  'Architect',
  'Lead',
  'Director',
];
const STATUSES: Status[] = ['Active', 'Inactive', 'Pending'];
const DEPTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
  'Legal',
];
const REGIONS = ['APAC', 'EMEA', 'AMER', 'LATAM'];
const DATES = [
  '2021-03-12',
  '2022-07-01',
  '2020-11-20',
  '2023-01-15',
  '2022-04-08',
  '2021-09-30',
  '2023-06-22',
  '2020-05-05',
  '2024-02-18',
  '2023-11-09',
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

/* Stable seed so hot-reload doesn't reshuffle */
let _seed = 42;
const rand = (): number => {
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff;
  return (_seed >>> 0) / 0xffffffff;
};
const pickS = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]!;
const randIntS = (min: number, max: number): number => Math.floor(rand() * (max - min + 1)) + min;

const ALL_PEOPLE: Person[] = Array.from({ length: 120 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  city: pickS(CITIES),
  country: pickS(COUNTRIES),
  company: pickS(COMPANIES),
  role: pickS(ROLES),
  salary: randIntS(40000, 120000),
  joined: pickS(DATES),
  score: randIntS(1, 100),
  status: pickS(STATUSES),
  dept: pickS(DEPTS),
  region: pickS(REGIONS),
}));

/* ─────────────────────────────────────────────
   CELL RENDERERS
───────────────────────────────────────────── */
const statusStyles: Record<Status, string> = {
  Active: 'bg-success/10 text-success border border-success/20',
  Inactive: 'bg-error/10 text-error border border-error/20',
  Pending: 'bg-warning/10 text-warning-text border border-warning/20',
};

const StatusBadge = ({ status }: { status: Status }): JSX.Element => (
  <span
    className={clsx(
      'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
      statusStyles[status]
    )}
  >
    {status}
  </span>
);

const ScoreCell = ({ score }: { score: number }): JSX.Element => (
  <span
    className={clsx(
      'font-semibold tabular-nums',
      score >= 80 ? 'text-success' : score >= 60 ? 'text-warning-text' : 'text-error'
    )}
  >
    {score}
  </span>
);

const SalaryCell = ({ salary }: { salary: number }): JSX.Element => (
  <span className="tabular-nums font-medium text-text">${salary.toLocaleString()}</span>
);

/* ─────────────────────────────────────────────
   EXPAND DETAIL PANEL
───────────────────────────────────────────── */
const ExpandDetail = ({ person }: { person: Person }): JSX.Element => (
  <div className="flex flex-wrap gap-3 p-3.5 bg-surface-muted/60">
    <div className="min-w-[170px] rounded-md border border-border bg-surface px-3.5 py-2.5">
      <strong className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-primary">
        Contact
      </strong>
      <p className="text-xs leading-relaxed text-text-muted">
        {person.email}
        <br />
        {person.city}, {person.country}
      </p>
    </div>

    <div className="min-w-[170px] rounded-md border border-border bg-surface px-3.5 py-2.5">
      <strong className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-primary">
        Company
      </strong>
      <p className="text-xs leading-relaxed text-text-muted">
        {person.company}
        <br />
        {person.dept}
        <br />
        {person.role}
      </p>
    </div>

    <div className="min-w-[170px] rounded-md border border-border bg-surface px-3.5 py-2.5">
      <strong className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-primary">
        Compensation
      </strong>
      <p className="text-xs leading-relaxed text-text-muted">
        ${person.salary.toLocaleString()}
        <br />
        Score: {person.score}
        <br />
        Region: {person.region}
      </p>
    </div>

    <div className="min-w-[130px] rounded-md border border-border bg-surface px-3.5 py-2.5">
      <strong className="mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-primary">
        Joined
      </strong>
      <p className="text-xs leading-relaxed text-text-muted">
        {person.joined}
        <br />
        <StatusBadge status={person.status} />
      </p>
    </div>
  </div>
);

/* ─────────────────────────────────────────────
   COLUMN DEFINITIONS
───────────────────────────────────────────── */
const COLUMNS: GridColumnDef<Person>[] = [
  {
    id: 'id',
    accessorKey: 'id',
    header: 'ID',
    size: 70,
    enableSorting: true,
    enableColumnFilter: true,
    meta: { pin: 'left', filterType: 'number', align: 'right' },
    cell: ({ getValue }) => (
      <span className="font-medium text-text-muted">{getValue() as number}</span>
    ),
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Name',
    size: 175,
    enableSorting: true,
    enableColumnFilter: true,
    meta: { pin: 'left', filterType: 'text' },
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
    size: 220,
    enableSorting: true,
    enableColumnFilter: true,
    meta: { pin: 'left', filterType: 'text' },
  },
  {
    id: 'city',
    accessorKey: 'city',
    header: 'City',
    size: 140,
    enableSorting: true,
    enableColumnFilter: true,
    meta: { filterType: 'text' },
  },
  {
    id: 'country',
    accessorKey: 'country',
    header: 'Country',
    size: 120,
    enableSorting: true,
    enableColumnFilter: true,
    meta: { filterType: 'text' },
  },
  {
    id: 'company',
    accessorKey: 'company',
    header: 'Company',
    size: 165,
    enableSorting: true,
    enableColumnFilter: true,
    meta: { filterType: 'text' },
  },
  {
    id: 'role',
    accessorKey: 'role',
    header: 'Role',
    size: 140,
    enableSorting: true,
    enableColumnFilter: true,
    meta: { filterType: 'text' },
  },
  {
    id: 'salary',
    accessorKey: 'salary',
    header: 'Salary',
    size: 130,
    enableSorting: true,
    enableColumnFilter: true,
    meta: { filterType: 'number', align: 'right' },
    cell: ({ getValue }) => <SalaryCell salary={getValue() as number} />,
  },
  {
    id: 'joined',
    accessorKey: 'joined',
    header: 'Joined',
    size: 130,
    enableSorting: true,
    enableColumnFilter: true,
    meta: { filterType: 'date' },
  },
  {
    id: 'score',
    accessorKey: 'score',
    header: 'Score',
    size: 90,
    enableSorting: true,
    enableColumnFilter: true,
    meta: { filterType: 'number', align: 'right' },
    cell: ({ getValue }) => <ScoreCell score={getValue() as number} />,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: 'Status',
    size: 110,
    enableSorting: true,
    enableColumnFilter: true,
    meta: { filterType: 'text', align: 'center' },
    cell: ({ getValue }) => <StatusBadge status={getValue() as Status} />,
  },
  {
    id: 'dept',
    accessorKey: 'dept',
    header: 'Department',
    size: 150,
    enableSorting: true,
    enableColumnFilter: true,
    meta: { filterType: 'text' },
  },
  {
    id: 'region',
    accessorKey: 'region',
    header: 'Region',
    size: 110,
    enableSorting: true,
    enableColumnFilter: true,
    meta: { filterType: 'text' },
  },
];

/* Reduced column sets used by the simpler progressive examples */
const SIMPLE_COLUMNS: GridColumnDef<Person>[] = COLUMNS.filter((col) =>
  ['id', 'name', 'email', 'city'].includes(col.id as string)
);

const SELECTION_COLUMNS: GridColumnDef<Person>[] = COLUMNS.filter((col) =>
  ['id', 'name', 'email', 'role', 'status'].includes(col.id as string)
);

/* ─────────────────────────────────────────────
   STOCK COLUMNS (real-time example)
───────────────────────────────────────────── */
const STOCK_COLUMNS: GridColumnDef<StockRow>[] = [
  {
    id: 'symbol',
    accessorKey: 'symbol',
    header: 'Symbol',
    size: 90,
    meta: { pin: 'left' },
    cell: ({ getValue }) => <span className="font-bold text-white">{getValue() as string}</span>,
  },
  { id: 'name', accessorKey: 'name', header: 'Company', size: 200 },
  { id: 'sector', accessorKey: 'sector', header: 'Sector', size: 150 },
  {
    id: 'price',
    accessorKey: 'price',
    header: 'Price',
    size: 110,
    meta: { align: 'right' },
    cell: ({ getValue }) => <FlashPriceCell price={getValue() as number} />,
  },
  {
    id: 'change',
    accessorKey: 'change',
    header: 'Change',
    size: 110,
    meta: { align: 'right' },
    cell: ({ getValue }) => <ChangeCell change={getValue() as number} />,
  },
  {
    id: 'volume',
    accessorKey: 'volume',
    header: 'Volume',
    size: 120,
    meta: { align: 'right' },
    cell: ({ getValue }) => <span className="tabular-nums text-white/70">{(getValue() as number).toLocaleString()}</span>,
  },
];

/* ─────────────────────────────────────────────
   CLIENT-SIDE FILTER LOGIC
   (simulates what a real API would do)
───────────────────────────────────────────── */
function matchesFilter(cellValue: unknown, filter: GridColumnFilterValue): boolean {
  const { operator, value } = filter;
  if (operator === 'none' || value === undefined || value === null || value === '') return true;

  const strVal = String(value).toLowerCase().trim();
  const strCell = String(cellValue ?? '')
    .toLowerCase()
    .trim();
  const numVal = Number(value);
  const numCell = Number(cellValue);

  switch (operator) {
    case 'contains':
      return strCell.includes(strVal);
    case 'not_contains':
      return !strCell.includes(strVal);
    case 'starts_with':
      return strCell.startsWith(strVal);
    case 'ends_with':
      return strCell.endsWith(strVal);
    case 'equals':
      return strCell === strVal;
    case 'not_equals':
      return strCell !== strVal;
    case 'lt':
      return !isNaN(numCell) && !isNaN(numVal) && numCell < numVal;
    case 'lte':
      return !isNaN(numCell) && !isNaN(numVal) && numCell <= numVal;
    case 'gt':
      return !isNaN(numCell) && !isNaN(numVal) && numCell > numVal;
    case 'gte':
      return !isNaN(numCell) && !isNaN(numVal) && numCell >= numVal;
    case 'is':
      return String(cellValue) === String(value);
    case 'is_not':
      return String(cellValue) !== String(value);
    case 'before':
      return new Date(String(cellValue)) < new Date(String(value));
    case 'after':
      return new Date(String(cellValue)) > new Date(String(value));
    default:
      return true;
  }
}

function applyStateToData(data: Person[], state: GridState): { rows: Person[]; total: number } {
  let result = data;

  // 1. Column filters
  if (state.columnFilters.length > 0) {
    result = result.filter((row) =>
      state.columnFilters.every((f) => {
        const colId = f.id as keyof Person;
        const filter = f.value as GridColumnFilterValue;
        return matchesFilter(row[colId], filter);
      })
    );
  }

  // 2. Global filter (searches across text-like fields)
  if (state.globalFilter != null && state.globalFilter.trim() !== '') {
    const q = state.globalFilter.toLowerCase();
    result = result.filter((row) =>
      Object.values(row).some((v) => String(v).toLowerCase().includes(q))
    );
  }

  // 3. Sorting (single-column)
  const sort = state.sorting[0];
  if (sort != null) {
    const key = sort.id as keyof Person;
    result = [...result].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      let cmp = 0;
      if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else {
        cmp = String(av ?? '').localeCompare(String(bv ?? ''));
      }
      return sort.desc ? -cmp : cmp;
    });
  }

  const total = result.length;

  // 4. Pagination
  const { pageIndex, pageSize } = state.pagination;
  result = result.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

  return { rows: result, total };
}

/* ─────────────────────────────────────────────
   USAGE CODE SNIPPETS
───────────────────────────────────────────── */
const SIMPLE_CODE = `<DataGrid
  data={rows}
  columns={columns}
  totalRows={total}
  state={state}
  onStateChange={setState}
  rowId={(row) => String(row.id)}
/>`;

const SELECTION_CODE = `<DataGrid
  data={rows}
  columns={columns}
  totalRows={total}
  state={state}
  onStateChange={setState}
  rowId={(row) => String(row.id)}
  enableRowSelection
/>`;

const FULL_CODE = `<DataGrid
  data={rows}
  columns={columns}
  totalRows={total}
  state={state}
  onStateChange={setState}
  rowId={(row) => String(row.id)}
  enableRowSelection
  enableRowExpansion
  enableColumnFilters
  enableSorting
  showTopBar
  onExportExcel={exportExcel}
  onExportPdf={exportPdf}
  renderExpandedRow={(row) => <ExpandDetail person={row.original} />}
/>`;

const STOCK_CODE = `const stocks = useLiveStockData(1500); // ticks every 1.5s

<DataGrid
  data={stocks}
  columns={columns}
  totalRows={stocks.length}
  state={state}
  onStateChange={setState}
  rowId={(row) => String(row.id)}
/>`;

/* ─────────────────────────────────────────────
   PAGE COMPONENT
───────────────────────────────────────────── */
export function GridDemoPage(): JSX.Element {
  // Step 1 — simple, read-only grid
  const [simpleState, setSimpleState] = useState<GridState>(() =>
    createInitialGridState({ pagination: { pageIndex: 0, pageSize: 8 } })
  );
  const simple = useMemo(() => applyStateToData(ALL_PEOPLE, simpleState), [simpleState]);

  // Step 2 — grid with row selection (checkboxes)
  const [selectionState, setSelectionState] = useState<GridState>(() =>
    createInitialGridState({ pagination: { pageIndex: 0, pageSize: 8 } })
  );
  const selection = useMemo(() => applyStateToData(ALL_PEOPLE, selectionState), [selectionState]);

  // Step 3 — full-featured grid (sorting, filters, selection, expansion, export)
  const [fullState, setFullState] = useState<GridState>(() =>
    createInitialGridState({ pagination: { pageIndex: 0, pageSize: 20 } })
  );
  const full = useMemo(() => applyStateToData(ALL_PEOPLE, fullState), [fullState]);

  // Step 4 — real-time streaming data (stock ticker)
  const stocks = useLiveStockData(1500);
  const [liveState, setLiveState] = useState<GridState>(() =>
    createInitialGridState({ pagination: { pageIndex: 0, pageSize: 20 } })
  );

  const renderExpandedRow = (row: Row<Person>): JSX.Element => (
    <ExpandDetail person={row.original} />
  );

  return (
    <DemoLayout
      title={META.title}
      description={`${META.description} · ${ALL_PEOPLE.length} records`}
      tags={META.tags}
      status={META.status}
      accent={META.accent}
      icon={META.icon}
    >
      <div className="flex flex-col gap-8 pb-8">
        <DemoExampleSection
          step={1}
          title="Simple grid"
          description="Just data + columns — no toolbar, sorting, filters, or selection."
          accent={META.accent}
          code={SIMPLE_CODE}
        >
          <DataGrid<Person>
            data={simple.rows}
            columns={SIMPLE_COLUMNS}
            totalRows={simple.total}
            state={simpleState}
            onStateChange={setSimpleState}
            rowId={(row) => String(row.id)}
            enableVirtualization={false}
            showToolbar={false}
            showTopBar
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
          <DataGrid<Person>
            data={selection.rows}
            columns={SELECTION_COLUMNS}
            totalRows={selection.total}
            state={selectionState}
            onStateChange={setSelectionState}
            rowId={(row) => String(row.id)}
            enableVirtualization={false}
            enableRowSelection
            showToolbar={false}
            showTopBar
            className="!rounded-none"
          />
        </DemoExampleSection>

        <DemoExampleSection
          step={3}
          title="Full configuration"
          description="Every feature on: sorting, column filters, selection, row expansion, and export."
          accent={META.accent}
          code={FULL_CODE}
        >
          <DataGrid<Person>
            data={full.rows}
            columns={COLUMNS}
            totalRows={full.total}
            state={fullState}
            onStateChange={setFullState}
            rowId={(row) => String(row.id)}
            enableVirtualization={false}
            enableRowSelection
            enableRowExpansion
            enableColumnFilters
            enableSorting
            showToolbar={false}
            showTopBar
            onExportExcel={() => void 0}
            onExportPdf={() => void 0}
            renderExpandedRow={renderExpandedRow}
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
          <DataGrid<StockRow>
            data={stocks}
            columns={STOCK_COLUMNS}
            totalRows={stocks.length}
            state={liveState}
            onStateChange={setLiveState}
            rowId={(row) => String(row.id)}
            enableVirtualization={false}
            showToolbar={false}
            showTopBar
            className="!rounded-none"
          />
        </DemoExampleSection>
      </div>
    </DemoLayout>
  );
}

/* suppress eslint warning for the pick helper only used in data generation */
void pick;
