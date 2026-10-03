import * as XLSX from 'xlsx';
import type { CellKey, CellsMap } from '../types/novaExcel.types';

/** Generate cell key from row/col (1-based) */
export function keyOf(r: number, c: number): CellKey {
  return `r${r}c${c}`;
}

/** Convert column number to letter label: 1→A, 26→Z, 27→AA */
export function colToLabel(n: number): string {
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

/** Convert row/col to Excel-style label: (1,1)→A1, (2,3)→C2 */
export function rcToLabel(r: number, c: number): string {
  return `${colToLabel(c)}${r}`;
}

/** Format a status-bar stat (Sum/Average): trims to 2 decimals, drops trailing zeros */
export function formatStat(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
}

const CELL_KEY_RE = /^r(\d+)c(\d+)$/;

/**
 * Re-key an r/c-keyed map (cells, styles, ...) after a row is inserted at `idx`,
 * mirroring the exact rule used for cell values. `inclusive: true` = rows >= idx
 * shift ("insert above"), `false` = rows > idx shift ("insert below").
 */
export function shiftMapRowInsert<T>(map: Record<string, T>, idx: number, inclusive: boolean): Record<string, T> {
  const cp: Record<string, T> = {};
  for (const [k, v] of Object.entries(map)) {
    const m = k.match(CELL_KEY_RE);
    if (!m) { cp[k] = v; continue; }
    const r = Number(m[1]);
    const c = Number(m[2]);
    const shifts = inclusive ? r >= idx : r > idx;
    cp[keyOf(shifts ? r + 1 : r, c)] = v;
  }
  return cp;
}

/** Same as {@link shiftMapRowInsert}, for columns. */
export function shiftMapColInsert<T>(map: Record<string, T>, idx: number, inclusive: boolean): Record<string, T> {
  const cp: Record<string, T> = {};
  for (const [k, v] of Object.entries(map)) {
    const m = k.match(CELL_KEY_RE);
    if (!m) { cp[k] = v; continue; }
    const r = Number(m[1]);
    const c = Number(m[2]);
    const shifts = inclusive ? c >= idx : c > idx;
    cp[keyOf(r, shifts ? c + 1 : c)] = v;
  }
  return cp;
}

/** Re-key a map after row `idx` is deleted: entries on that row are dropped. */
export function shiftMapRowDelete<T>(map: Record<string, T>, idx: number): Record<string, T> {
  const cp: Record<string, T> = {};
  for (const [k, v] of Object.entries(map)) {
    const m = k.match(CELL_KEY_RE);
    if (!m) { cp[k] = v; continue; }
    const r = Number(m[1]);
    const c = Number(m[2]);
    if (r < idx) cp[k] = v;
    else if (r > idx) cp[keyOf(r - 1, c)] = v;
  }
  return cp;
}

/** Same as {@link shiftMapRowDelete}, for columns. */
export function shiftMapColDelete<T>(map: Record<string, T>, idx: number): Record<string, T> {
  const cp: Record<string, T> = {};
  for (const [k, v] of Object.entries(map)) {
    const m = k.match(CELL_KEY_RE);
    if (!m) { cp[k] = v; continue; }
    const r = Number(m[1]);
    const c = Number(m[2]);
    if (c < idx) cp[k] = v;
    else if (c > idx) cp[keyOf(r, c - 1)] = v;
  }
  return cp;
}

/** Parse label like "A1" to {r, c} */
export function labelToRc(label: string): { r: number; c: number } | null {
  const match = label.match(/^([A-Z]+)(\d+)$/);
  if (match == null) return null;
  const colLetters = match[1];
  const row = Number(match[2]);
  let col = 0;
  for (let i = 0; i < colLetters.length; i++) {
    col = col * 26 + (colLetters.charCodeAt(i) - 64);
  }
  return { r: row, c: col };
}

/** Expand range "A1:B3" to array of cell keys */
export function rangeToCellKeys(aLabel: string, bLabel: string): CellKey[] {
  const a = labelToRc(aLabel);
  const b = labelToRc(bLabel);
  if (a == null || b == null) return [];
  const r1 = Math.min(a.r, b.r);
  const r2 = Math.max(a.r, b.r);
  const c1 = Math.min(a.c, b.c);
  const c2 = Math.max(a.c, b.c);
  const out: CellKey[] = [];
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      out.push(keyOf(r, c));
    }
  }
  return out;
}

/** Convert sheet cells to CSV string */
export function sheetToCSV(rows: number, cols: number, cells: CellsMap): string {
  const out: string[] = [];
  for (let r = 1; r <= rows; r++) {
    const row: string[] = [];
    for (let c = 1; c <= cols; c++) {
      const v = cells[keyOf(r, c)] ?? '';
      row.push(`"${String(v).replace(/"/g, '""')}"`);
    }
    out.push(row.join(','));
  }
  return out.join('\n');
}

/** Parse CSV text to 2D array */
export function csvToRows(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.split(/\r\n|\n/);
  for (const line of lines) {
    const cells: string[] = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === ',' && !inQuote) {
        cells.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    cells.push(cur);
    rows.push(cells);
  }
  return rows;
}

/** Download a string as a file */
export function downloadAsFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Export cells to .xlsx and trigger download */
export function exportToXlsx(rows: number, cols: number, cells: CellsMap, filename = 'sheet.xlsx'): void {
  const data: string[][] = [];
  for (let r = 1; r <= rows; r++) {
    const row: string[] = [];
    for (let c = 1; c <= cols; c++) row.push(cells[keyOf(r, c)] ?? '');
    data.push(row);
  }
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, filename);
}

/** Parse .xlsx file to CellsMap preserving original cell positions and formulas */
export function xlsxToCellsMap(buffer: ArrayBuffer): { cells: CellsMap; rows: number; cols: number } {
  const wb = XLSX.read(buffer, { type: 'array', cellFormula: true });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (ws == null) return { cells: {}, rows: 0, cols: 0 };

  const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
  const cells: CellsMap = {};
  let maxRow = 0;
  let maxCol = 0;

  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      const cell = ws[addr];
      if (cell == null) continue;

      const row = r + 1; // 1-based
      const col = c + 1; // 1-based
      if (row > maxRow) maxRow = row;
      if (col > maxCol) maxCol = col;

      if (cell.f) {
        cells[keyOf(row, col)] = `=${cell.f}`;
      } else if (cell.v != null && String(cell.v) !== '') {
        cells[keyOf(row, col)] = String(cell.v);
      }
    }
  }

  return { cells, rows: maxRow, cols: maxCol };
}
