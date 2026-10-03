import type { ReactNode } from 'react';

// ─── Cell ────────────────────────────────────────────────────────────────────

export type CellKey = string; // "r{row}c{col}"

export type CellsMap = Record<CellKey, string>;

export type StylesMap = Record<CellKey, React.CSSProperties>;

// ─── Sheet ───────────────────────────────────────────────────────────────────

export interface Sheet {
  name: string;
  cells: CellsMap;
  colWidths: number[];
  rowHeights: number[];
  styles: StylesMap;
  frozenRows: number;
  frozenCols: number;
  /** Merged cell rectangles (top-left/bottom-right, 1-based, inclusive) */
  merges?: SelectionRange[];
}

// ─── Selection & Edit Mode ───────────────────────────────────────────────────

export type CellMode = 'select' | 'edit';

export interface CellPosition {
  r: number;
  c: number;
}

export interface SelectionRange {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
}

/** Status-bar stats for the current selection (like Excel/Sheets' Count/Sum/Average) */
export interface SelectionStats {
  count: number;
  numericCount: number;
  sum: number;
  average: number;
}

// ─── Context Menu ────────────────────────────────────────────────────────────

export type ContextTarget = 'col' | 'row' | 'sheet';

export interface ContextMenuState {
  type: ContextTarget;
  index: number;
  x: number;
  y: number;
}

// ─── Undo ────────────────────────────────────────────────────────────────────

export interface UndoSnapshot {
  cells: CellsMap;
  colWidths: number[];
  rowHeights: number[];
  styles: StylesMap;
  merges: SelectionRange[];
}

// ─── Virtual Window ──────────────────────────────────────────────────────────

export interface VirtualWindow {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
  padTop: number;
  padBottom: number;
  padLeft: number;
  padRight: number;
}

// ─── Grid Dimensions (infinite, grows on demand) ─────────────────────────────

export interface GridDimensions {
  rows: number;
  cols: number;
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface NovaExcelProps {
  /** Initial sheets data */
  initialSheets?: Sheet[];
  /** Called whenever active sheet changes */
  onChange?: (sheets: Sheet[], activeIndex: number) => void;
  /** Initial rows (default 100) */
  rows?: number;
  /** Initial cols (default 26) */
  cols?: number;
  /** Show toolbar */
  showToolbar?: boolean;
  /** Show formula bar */
  showFormulaBar?: boolean;
  /** Show sheet tabs */
  showSheetTabs?: boolean;
  /** Read-only mode */
  readOnly?: boolean;
  /** Custom class */
  className?: string;
  /** Max height */
  maxHeight?: string;
  /** Cell height in px (default 18) */
  cellHeight?: number;
  /** Default column width (default 80) */
  defaultColWidth?: number;
}

// ─── Formula ─────────────────────────────────────────────────────────────────

export interface FormulaResult {
  value: string | number;
  error?: string;
}

// ─── Filter ──────────────────────────────────────────────────────────────────

export type FilterMap = Record<number, string>;
export type FilterEnabledMap = Record<number, boolean>;

// ─── Internal Context ────────────────────────────────────────────────────────

export interface NovaExcelContextValue {
  // Dimensions
  dims: GridDimensions;
  cellHeight: number;
  defaultColWidth: number;

  // Active sheet data
  cells: CellsMap;
  colWidths: number[];
  rowHeights: number[];
  styles: StylesMap;
  computed: Record<string, string | number>;

  // Selection
  selected: CellPosition | null;
  selectionRange: SelectionRange | null;
  cellMode: CellMode;

  // Actions
  setSelected: (pos: CellPosition | null) => void;
  setSelectionRange: (range: SelectionRange | null) => void;
  setCellMode: (mode: CellMode) => void;
  setCellValue: (r: number, c: number, value: string) => void;

  // Read-only
  readOnly: boolean;
}
