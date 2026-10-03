import { useEffect, useRef, useState, type JSX } from 'react';
import clsx from 'clsx';

interface AnimatedExcelPreviewProps {
  className?: string;
}

const ACCENT_HEX = '#34d399';
const COL_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
const COL_WIDTHS = [104, 52, 52, 52, 52, 60, 52, 62];
const HEADER_LABELS = ['Category', 'Q1', 'Q2', 'Q3', 'Q4', 'Total', 'Avg', 'Growth'];
const ROW_H = 28;

interface DataRow {
  category: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
}

const DATA: DataRow[] = [
  { category: 'Marketing', q1: 42, q2: 51, q3: 47, q4: 53 },
  { category: 'Sales', q1: 88, q2: 92, q3: 101, q4: 97 },
  { category: 'Engineering', q1: 130, q2: 128, q3: 142, q4: 150 },
  { category: 'Support', q1: 34, q2: 30, q3: 38, q4: 36 },
  { category: 'R&D', q1: 60, q2: 65, q3: 70, q4: 75 },
  { category: 'Operations', q1: 45, q2: 48, q3: 44, q4: 50 },
  { category: 'HR', q1: 22, q2: 24, q3: 23, q4: 25 },
  { category: 'Finance', q1: 55, q2: 58, q3: 60, q4: 63 },
];

// Selectable numeric columns: index into COL_LETTERS/HEADER_LABELS (1=Q1 … 5=Total, 6=Avg, 7=Growth)
const CYCLE_COLS = [1, 2, 3, 4, 5, 6];

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function numericValue(d: DataRow, col: number): number {
  switch (col) {
    case 1: return d.q1;
    case 2: return d.q2;
    case 3: return d.q3;
    case 4: return d.q4;
    case 5: return d.q1 + d.q2 + d.q3 + d.q4;
    case 6: return Math.round((d.q1 + d.q2 + d.q3 + d.q4) / 4);
    case 7: return Math.round(((d.q4 - d.q1) / d.q1) * 100);
    default: return 0;
  }
}

function cellValue(rowIndex: number, col: number): string {
  if (rowIndex === 0) return HEADER_LABELS[col] ?? '';
  const d = DATA[rowIndex - 1];
  if (d == null) return '';
  if (col === 0) return d.category;
  const value = numericValue(d, col);
  return col === 7 ? `${value}%` : String(value);
}

function columnSum(col: number, throughRow: number): number {
  let sum = 0;
  for (let i = 0; i < throughRow && i < DATA.length; i++) {
    const d = DATA[i];
    if (d == null) continue;
    sum += numericValue(d, col);
  }
  return sum;
}

interface Selection {
  col: number;
  toRow: number;
}

export function AnimatedExcelPreview({ className }: AnimatedExcelPreviewProps): JSX.Element {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [formula, setFormula] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [filling, setFilling] = useState(false);
  const aliveRef = useRef(true);

  useEffect(() => {
    aliveRef.current = true;
    const isAlive = (): boolean => aliveRef.current;

    async function runLoop(): Promise<void> {
      while (isAlive()) {
        for (const col of CYCLE_COLS) {
          if (!isAlive()) return;
          for (let r = 1; r <= DATA.length; r++) {
            if (!isAlive()) return;
            setSelection({ col, toRow: r });
            await sleep(70);
          }
          await sleep(350);
          if (!isAlive()) return;

          setFormula(`=SUM(${COL_LETTERS[col]}2:${COL_LETTERS[col]}${DATA.length + 1})`);
          await sleep(250);
          setShowStats(true);
          await sleep(1300);
          if (!isAlive()) return;

          setFilling(true);
          await sleep(450);
          if (!isAlive()) return;
          setFilling(false);
          setShowStats(false);
          setFormula('');
          setSelection(null);
          await sleep(500);
        }
        await sleep(600);
      }
    }

    void runLoop();
    return () => { aliveRef.current = false; };
  }, []);

  const sum = selection != null ? columnSum(selection.col, selection.toRow) : 0;
  const count = selection != null ? selection.toRow : 0;
  const avg = count > 0 ? Math.round(sum / count) : 0;

  return (
    <div
      className={clsx('flex flex-col overflow-hidden rounded-none border border-white/10 bg-[#0a0a12] shadow-2xl select-none', className)}
      style={{ pointerEvents: 'none' }}
    >
      {/* Browser chrome */}
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-white/[0.03] px-3 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <div className="ml-2 flex-1 truncate rounded bg-white/5 px-3 py-1 text-[10px] text-white/40">
          app.componentlibrary.dev / demo / nova-excel
        </div>
      </div>

      {/* Formula bar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2 text-[10px] text-white/60">
        <span className="rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-mono text-white/70">
          {selection != null ? `${COL_LETTERS[selection.col]}${selection.toRow + 1}` : 'A1'}
        </span>
        <span className="italic text-white/30" style={{ fontStyle: 'italic' }}>fx</span>
        <span className="min-h-[14px] flex-1 truncate font-mono text-white/70">{formula}</span>
      </div>

      {/* Spreadsheet grid */}
      <div className="max-h-[280px] overflow-auto">
        <table className="w-full border-collapse text-[11px]" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr className="sticky top-0 z-10" style={{ background: '#12121e' }}>
              <th className="w-7 border-b border-r border-white/10" />
              {COL_LETTERS.map((letter) => (
                <th
                  key={letter}
                  className="border-b border-r border-white/10 text-center font-semibold text-white/40"
                  style={{ width: COL_WIDTHS[COL_LETTERS.indexOf(letter)], fontSize: 9 }}
                >
                  {letter}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: DATA.length + 1 }, (_, rowIndex) => (
              <tr key={rowIndex} style={{ height: ROW_H }}>
                <td className="border-b border-r border-white/10 text-center text-[9px] text-white/30" style={{ background: '#12121e' }}>
                  {rowIndex + 1}
                </td>
                {COL_LETTERS.map((_, col) => {
                  const isHeaderRow = rowIndex === 0;
                  const isSelected = !isHeaderRow && selection != null && selection.col === col && rowIndex <= selection.toRow;
                  const isTail = isSelected && rowIndex === selection?.toRow;
                  return (
                    <td
                      key={col}
                      className={clsx(
                        'relative truncate border-b border-r border-white/5 px-1.5',
                        isHeaderRow ? 'font-semibold text-white/70' : col === 0 ? 'text-white/70' : 'text-right text-white/60',
                      )}
                      style={{
                        backgroundColor: isSelected ? (filling ? `${ACCENT_HEX}33` : `${ACCENT_HEX}14`) : 'transparent',
                        outline: isSelected ? `1px solid ${ACCENT_HEX}66` : 'none',
                        outlineOffset: -1,
                        transition: 'background-color 0.3s ease-out',
                      }}
                    >
                      {cellValue(rowIndex, col)}
                      {isTail && (
                        <span
                          className="absolute -bottom-[3px] -right-[3px] h-1.5 w-1.5 rounded-[1px]"
                          style={{ backgroundColor: ACCENT_HEX }}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Selection stats — height stays reserved always, only fades, so the card's total height never jumps. */}
      <div className={clsx('flex h-8 shrink-0 items-center justify-end gap-3 border-t border-white/10 px-3 text-[10px] text-white/50 transition-opacity', showStats ? 'opacity-100' : 'opacity-0')}>
        <span>Count: <b className="text-white">{count}</b></span>
        <span>Sum: <b style={{ color: ACCENT_HEX }}>{sum}</b></span>
        <span>Avg: <b className="text-white">{avg}</b></span>
      </div>

      {/* Sheet tabs */}
      <div className="flex shrink-0 items-center gap-1 border-t border-white/10 bg-white/[0.02] px-3 py-1.5">
        <span className="rounded-t border border-b-0 border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-medium text-emerald-300">Sheet1</span>
        <span className="rounded-t px-2.5 py-1 text-[10px] text-white/35">Sheet2</span>
        <span className="rounded-t px-2.5 py-1 text-[10px] text-white/35">Sheet3</span>
        <span className="px-1.5 text-[11px] text-white/25">+</span>
      </div>
    </div>
  );
}
