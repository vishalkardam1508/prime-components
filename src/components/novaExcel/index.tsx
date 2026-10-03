import { useCallback, useEffect, useMemo, useRef, useState, type JSX } from 'react';
import clsx from 'clsx';
import { createPortal } from 'react-dom';
import type { NovaExcelProps, CellsMap, StylesMap, Sheet, CellPosition, CellMode, SelectionRange, GridDimensions, ContextMenuState, SelectionStats } from './types/novaExcel.types';
import { novaExcelTheme as th } from './theme/novaExcelTheme';
import { keyOf, colToLabel, rcToLabel, sheetToCSV, csvToRows, downloadAsFile, exportToXlsx, xlsxToCellsMap, formatStat, shiftMapRowInsert, shiftMapColInsert, shiftMapRowDelete, shiftMapColDelete } from './utils/novaExcel.helpers';
import { findMergeAt, rangesOverlap, insertRowIntoMerges, insertColIntoMerges, deleteRowFromMerges, deleteColFromMerges } from './utils/novaExcel.merge';
import { recomputeAllFormulas } from './utils/novaExcel.formula';
import { useNovaExcelUndo } from './hooks/useNovaExcelUndo';
import { useNovaExcelClipboard } from './hooks/useNovaExcelClipboard';
import { useNovaExcelKeyboard } from './hooks/useNovaExcelKeyboard';
import { useNovaExcelVirtualScroll } from './hooks/useNovaExcelVirtualScroll';
import { useNovaExcelResize } from './hooks/useNovaExcelResize';
import { useNovaExcelAutoExpand } from './hooks/useNovaExcelAutoExpand';
import { useNovaExcelFillHandle } from './hooks/useNovaExcelFillHandle';
import { NovaExcelSheetTabs } from './components/novaExcelSheetTabs';
import { NovaExcelContextMenu, type ContextAction } from './components/novaExcelContextMenu';
import { NovaExcelToolbar } from './components/novaExcelToolbar';

const DEFAULT_CELL_HEIGHT = 18;
const DEFAULT_COL_WIDTH = 80;


export function NovaExcel({
  initialSheets,
  onChange,
  rows: initRows = 100,
  cols: initCols = 26,
  showToolbar = true,
  showFormulaBar = true,
  showSheetTabs = true,
  readOnly = false,
  className,
  maxHeight = '70vh',
  cellHeight = DEFAULT_CELL_HEIGHT,
  defaultColWidth = DEFAULT_COL_WIDTH,
}: NovaExcelProps): JSX.Element {
  // ─── Multi-sheet state ─────────────────────────────────────────────────────
  const [sheets, setSheets] = useState<Sheet[]>(initialSheets ?? [{
    name: 'Sheet 1', cells: {}, colWidths: [], rowHeights: [], styles: {}, frozenRows: 0, frozenCols: 0,
  }]);
  const [activeSheet, setActiveSheet] = useState(0);

  // ─── Active sheet data ─────────────────────────────────────────────────────
  const [cells, setCells] = useState<CellsMap>(sheets[0]?.cells ?? {});
  const [colWidths, setColWidths] = useState<number[]>(sheets[0]?.colWidths ?? []);
  const [styles, setStyles] = useState<StylesMap>(sheets[0]?.styles ?? {});
  const [merges, setMerges] = useState<SelectionRange[]>(sheets[0]?.merges ?? []);
  const [dims, setDims] = useState<GridDimensions>({ rows: initRows, cols: initCols });

  // ─── Selection ─────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<CellPosition | null>(null);
  const [selectionRange, setSelectionRange] = useState<SelectionRange | null>(null);
  const [cellMode, setCellMode] = useState<CellMode>('select');
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [cellContextMenu, setCellContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [formulaBarText, setFormulaBarText] = useState('');
  const [computed, setComputed] = useState<Record<string, string | number>>({});
  const [zoom, setZoom] = useState(100);
  const [isSheetLoading, setIsSheetLoading] = useState(false);
  const [filterEnabled, setFilterEnabled] = useState<Record<number, boolean>>({});
  const [filterForCol, setFilterForCol] = useState<Record<number, string>>({});
  const internalClipboard = useRef<{ type: 'row' | 'col'; index: number; data: string[] } | null>(null);

  const anchorRef = useRef<CellPosition | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isMouseSelectingRef = useRef(false);

  // ─── Hooks ─────────────────────────────────────────────────────────────────
  const redoStackRef = useRef<import('./types/novaExcel.types').UndoSnapshot[]>([]);

  const { pushSnapshot, undo: undoSnapshot } = useNovaExcelUndo();
  const pushUndo = useCallback((): void => {
    pushSnapshot({ cells: { ...cells }, colWidths: [...colWidths], rowHeights: [], styles: { ...styles }, merges: [...merges] });
  }, [pushSnapshot, cells, colWidths, styles, merges]);

  const performUndo = useCallback((): void => {
    const snapshot = undoSnapshot();
    if (snapshot == null) return;
    // Push current state to redo
    redoStackRef.current.push({ cells: { ...cells }, colWidths: [...colWidths], rowHeights: [], styles: { ...styles }, merges: [...merges] });
    setCells(snapshot.cells);
    setColWidths(snapshot.colWidths);
    setStyles(snapshot.styles);
    setMerges(snapshot.merges);
  }, [undoSnapshot, cells, colWidths, styles, merges]);

  const performRedo = useCallback((): void => {
    const last = redoStackRef.current.pop();
    if (last == null) return;
    // Push current state to undo
    pushSnapshot({ cells: { ...cells }, colWidths: [...colWidths], rowHeights: [], styles: { ...styles }, merges: [...merges] });
    setCells(last.cells);
    setColWidths(last.colWidths);
    setStyles(last.styles);
    setMerges(last.merges);
  }, [pushSnapshot, cells, colWidths, styles, merges]);

  const { copy } = useNovaExcelClipboard({ cells, selected, selectionRange, setCells, pushUndo });

  const cut = useCallback((): void => {
    if (selected == null) return;
    void copy();
    pushUndo();
    setCells((prev) => {
      const cp = { ...prev };
      if (selectionRange != null) {
        for (let r = selectionRange.r1; r <= selectionRange.r2; r++)
          for (let c = selectionRange.c1; c <= selectionRange.c2; c++) delete cp[keyOf(r, c)];
      } else if (selected.r > 0 && selected.c > 0) {
        delete cp[keyOf(selected.r, selected.c)];
      }
      return cp;
    });
  }, [copy, selected, selectionRange, pushUndo, setCells]);

  const paste = useCallback((): void => {
    if (selected == null || selected.r <= 0 || selected.c <= 0) return;
    pushUndo();
    void navigator.clipboard.readText().then((text) => {
      const rows = text.split('\n').map((row) => row.split('\t'));
      setCells((prev) => {
        const cp = { ...prev };
        for (let r = 0; r < rows.length; r++) {
          for (let c = 0; c < rows[r].length; c++) {
            const val = rows[r][c].trim();
            const k = keyOf(selected.r + r, selected.c + c);
            if (val) cp[k] = val; else delete cp[k];
          }
        }
        return cp;
      });
    }).catch(() => {});
  }, [selected, pushUndo, setCells]);

  const { ensureCellExists, expandOnScrollEdge } = useNovaExcelAutoExpand({ dims, setDims });

  const { onResizeStart } = useNovaExcelResize({ colWidths, setColWidths, defaultColWidth });

  // ─── Zoom-adjusted dimensions ─────────────────────────────────────
  const zoomFactor = zoom / 100;
  const zoomedCellHeight = Math.round(cellHeight * zoomFactor);
  const zoomedDefaultColWidth = Math.round(defaultColWidth * zoomFactor);
  const zoomedColWidths = colWidths.map((w) => Math.round(w * zoomFactor));

  const { fillPreview, onFillHandleMouseDown } = useNovaExcelFillHandle({
    selected, selectionRange, cells, dims, cellHeight: zoomedCellHeight,
    colWidths: zoomedColWidths, defaultColWidth: zoomedDefaultColWidth,
    containerRef, setCells, pushUndo,
  });

  const { virtualWindow, handleScroll, totalWidth, totalHeight } = useNovaExcelVirtualScroll({
    dims, cellHeight: zoomedCellHeight, colWidths: zoomedColWidths, defaultColWidth: zoomedDefaultColWidth, containerRef,
  });

  const commitEdit = useCallback((): void => {
    if (selectionRange != null) {
      setCells((prev) => {
        const cp = { ...prev };
        for (let r = selectionRange.r1; r <= selectionRange.r2; r++)
          for (let c = selectionRange.c1; c <= selectionRange.c2; c++)
            delete cp[keyOf(r, c)];
        return cp;
      });
    } else if (selected != null && selected.r > 0 && selected.c > 0) {
      setCells((prev) => { const cp = { ...prev }; delete cp[keyOf(selected.r, selected.c)]; return cp; });
    }
  }, [selected, selectionRange, setCells]);

  const { handleGridKeyDown } = useNovaExcelKeyboard({
    dims, selected, setSelected, cellMode, setCellMode,
    selectionRange, setSelectionRange, anchorRef,
    onUndo: performUndo, onRedo: performRedo, onCopy: copy, onCut: cut, onPaste: paste,
    onStartEdit: (char: string) => {
      if (selected != null && selected.r > 0 && selected.c > 0) {
        // Append to the existing value instead of wiping it — typing on a
        // selected cell shouldn't discard whatever was already there.
        const prior = cells[keyOf(selected.r, selected.c)] ?? '';
        setCellValue(selected.r, selected.c, prior + char);
      }
    },
    ensureCellExists, commitEdit,
  });

  // ─── Formula recompute ─────────────────────────────────────────────────────
  useEffect(() => {
    const allSheetData = sheets.map((s, i) => ({
      name: s.name,
      cells: i === activeSheet ? cells : s.cells,
    }));
    setComputed(recomputeAllFormulas(cells, allSheetData, activeSheet));
  }, [cells, sheets, activeSheet]);

  // ─── Formula bar sync ──────────────────────────────────────────────────────
  useEffect(() => {
    if (selected != null) setFormulaBarText(cells[keyOf(selected.r, selected.c)] ?? '');
    else setFormulaBarText('');
  }, [selected, cells]);

  // ─── Selection stats (Count / Sum / Average) ───────────────────────────────
  const selectionStats = useMemo((): SelectionStats | null => {
    const range = selectionRange ?? (selected != null ? { r1: selected.r, c1: selected.c, r2: selected.r, c2: selected.c } : null);
    if (range == null) return null;

    let count = 0;
    let numericCount = 0;
    let sum = 0;

    for (let r = range.r1; r <= range.r2; r++) {
      for (let c = range.c1; c <= range.c2; c++) {
        count++;
        const val = computed[keyOf(r, c)];
        const num = typeof val === 'number' ? val : Number(val);
        if (val !== '' && val != null && !Number.isNaN(num)) {
          numericCount++;
          sum += num;
        }
      }
    }

    return { count, numericCount, sum, average: numericCount > 0 ? sum / numericCount : 0 };
  }, [selectionRange, selected, computed]);

  // ─── Auto-expand on scroll edge ────────────────────────────────────────────
  useEffect(() => {
    expandOnScrollEdge(virtualWindow.endRow, virtualWindow.endCol);
  }, [virtualWindow.endRow, virtualWindow.endCol, expandOnScrollEdge]);

  // ─── onChange ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const sheet: Sheet = { name: sheets[activeSheet]?.name ?? 'Sheet', cells, colWidths, rowHeights: [], styles, merges, frozenRows: 0, frozenCols: 0 };
    const updated = [...sheets];
    updated[activeSheet] = sheet;
    onChange?.(updated, activeSheet);
  }, [cells, colWidths, styles, merges]);

  // ─── Cell value ────────────────────────────────────────────────────────────
  const setCellValue = useCallback((r: number, c: number, value: string): void => {
    setCells((prev) => {
      const cp = { ...prev };
      if (value === '') delete cp[keyOf(r, c)];
      else cp[keyOf(r, c)] = value;
      return cp;
    });
  }, []);

  // ─── Merge / Unmerge cells ──────────────────────────────────────────────────
  const mergeCells = useCallback((): void => {
    if (selectionRange == null) return;
    const { r1, c1, r2, c2 } = selectionRange;
    if (r1 === r2 && c1 === c2) return; // nothing to merge

    pushUndo();
    const next: SelectionRange = { r1, c1, r2, c2 };
    setMerges((prev) => [...prev.filter((m) => !rangesOverlap(m, next)), next]);
    // Standard spreadsheet behavior: only the top-left value survives the merge
    setCells((prev) => {
      const cp = { ...prev };
      for (let r = r1; r <= r2; r++) {
        for (let c = c1; c <= c2; c++) {
          if (r === r1 && c === c1) continue;
          delete cp[keyOf(r, c)];
        }
      }
      return cp;
    });
    setSelected({ r: r1, c: c1 });
    setSelectionRange(next);
  }, [selectionRange, pushUndo]);

  const unmergeCells = useCallback((): void => {
    if (selected == null) return;
    const merge = findMergeAt(merges, selected.r, selected.c);
    if (merge == null) return;
    pushUndo();
    setMerges((prev) => prev.filter((m) => m !== merge));
  }, [selected, merges, pushUndo]);

  // ─── Toolbar actions ───────────────────────────────────────────────────────
  const addRow = (): void => { setDims((d) => ({ ...d, rows: d.rows + 1 })); };
  const addCol = (): void => { setDims((d) => ({ ...d, cols: d.cols + 1 })); };
  const exportCSV = (): void => { downloadAsFile(sheetToCSV(dims.rows, dims.cols, cells), 'sheet.csv', 'text/csv'); };
  const exportXlsx = (): void => { exportToXlsx(dims.rows, dims.cols, cells); };

  const importFile = (file: File): void => {
    const isXlsx = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
    const reader = new FileReader();
    reader.onload = (e) => {
      pushUndo();
      if (isXlsx) {
        const { cells: newCells, rows: nr, cols: nc } = xlsxToCellsMap(e.target?.result as ArrayBuffer);
        setCells(newCells);
        setDims({ rows: Math.max(initRows, nr + 20), cols: Math.max(initCols, nc + 5) });
      } else {
        const rowsData = csvToRows(String(e.target?.result ?? ''));
        const nr = rowsData.length;
        const nc = Math.max(0, ...rowsData.map((r) => r.length));
        const newCells: CellsMap = {};
        for (let r = 1; r <= nr; r++) for (let c = 1; c <= nc; c++) { const v = rowsData[r-1]?.[c-1] ?? ''; if (v) newCells[keyOf(r, c)] = v; }
        setCells(newCells);
        setDims({ rows: Math.max(initRows, nr + 20), cols: Math.max(initCols, nc + 5) });
      }
    };
    if (isXlsx) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  };

  // ─── Insert/Delete relative to selection ────────────────────────────────────
  const insertRowAbove = (): void => {
    const idx = selected?.r ?? dims.rows;
    if (idx <= 0) { addRow(); return; }
    pushUndo();
    setCells((prev) => { const cp: CellsMap = {}; for (const [k, v] of Object.entries(prev)) { const m = k.match(/^r(\d+)c(\d+)$/); if (!m) { cp[k] = v; continue; } const r = Number(m[1]); const c = Number(m[2]); if (r < idx) cp[k] = v; else cp[keyOf(r + 1, c)] = v; } return cp; });
    setStyles((prev) => shiftMapRowInsert(prev, idx, true));
    setMerges((prev) => insertRowIntoMerges(prev, idx, true));
    setDims((d) => ({ ...d, rows: d.rows + 1 }));
  };
  const insertRowBelow = (): void => {
    const idx = selected?.r ?? dims.rows;
    if (idx <= 0) { addRow(); return; }
    pushUndo();
    setCells((prev) => { const cp: CellsMap = {}; for (const [k, v] of Object.entries(prev)) { const m = k.match(/^r(\d+)c(\d+)$/); if (!m) { cp[k] = v; continue; } const r = Number(m[1]); const c = Number(m[2]); if (r <= idx) cp[k] = v; else cp[keyOf(r + 1, c)] = v; } return cp; });
    setStyles((prev) => shiftMapRowInsert(prev, idx, false));
    setMerges((prev) => insertRowIntoMerges(prev, idx, false));
    setDims((d) => ({ ...d, rows: d.rows + 1 }));
  };
  const insertColBefore = (): void => {
    const idx = selected?.c ?? dims.cols;
    if (idx <= 0) { addCol(); return; }
    pushUndo();
    setCells((prev) => { const cp: CellsMap = {}; for (const [k, v] of Object.entries(prev)) { const m = k.match(/^r(\d+)c(\d+)$/); if (!m) { cp[k] = v; continue; } const r = Number(m[1]); const c = Number(m[2]); if (c < idx) cp[k] = v; else cp[keyOf(r, c + 1)] = v; } return cp; });
    setStyles((prev) => shiftMapColInsert(prev, idx, true));
    setMerges((prev) => insertColIntoMerges(prev, idx, true));
    setDims((d) => ({ ...d, cols: d.cols + 1 }));
    setColWidths((p) => { const cp = [...p]; cp.splice(idx - 1, 0, defaultColWidth); return cp; });
  };
  const insertColAfter = (): void => {
    const idx = selected?.c ?? dims.cols;
    if (idx <= 0) { addCol(); return; }
    pushUndo();
    setCells((prev) => { const cp: CellsMap = {}; for (const [k, v] of Object.entries(prev)) { const m = k.match(/^r(\d+)c(\d+)$/); if (!m) { cp[k] = v; continue; } const r = Number(m[1]); const c = Number(m[2]); if (c <= idx) cp[k] = v; else cp[keyOf(r, c + 1)] = v; } return cp; });
    setStyles((prev) => shiftMapColInsert(prev, idx, false));
    setMerges((prev) => insertColIntoMerges(prev, idx, false));
    setDims((d) => ({ ...d, cols: d.cols + 1 }));
    setColWidths((p) => { const cp = [...p]; cp.splice(idx, 0, defaultColWidth); return cp; });
  };
  const deleteRow = (): void => {
    const idx = selected?.r;
    if (idx == null || idx <= 0) return;
    pushUndo();
    setCells((prev) => { const cp: CellsMap = {}; for (const [k, v] of Object.entries(prev)) { const m = k.match(/^r(\d+)c(\d+)$/); if (!m) { cp[k] = v; continue; } const r = Number(m[1]); const c = Number(m[2]); if (r < idx) cp[k] = v; else if (r > idx) cp[keyOf(r - 1, c)] = v; } return cp; });
    setStyles((prev) => shiftMapRowDelete(prev, idx));
    setMerges((prev) => deleteRowFromMerges(prev, idx));
    setDims((d) => ({ ...d, rows: Math.max(1, d.rows - 1) }));
  };
  const deleteCol = (): void => {
    const idx = selected?.c;
    if (idx == null || idx <= 0) return;
    pushUndo();
    setCells((prev) => { const cp: CellsMap = {}; for (const [k, v] of Object.entries(prev)) { const m = k.match(/^r(\d+)c(\d+)$/); if (!m) { cp[k] = v; continue; } const r = Number(m[1]); const c = Number(m[2]); if (c < idx) cp[k] = v; else if (c > idx) cp[keyOf(r, c - 1)] = v; } return cp; });
    setStyles((prev) => shiftMapColDelete(prev, idx));
    setMerges((prev) => deleteColFromMerges(prev, idx));
    setDims((d) => ({ ...d, cols: Math.max(1, d.cols - 1) }));
    setColWidths((p) => { const cp = [...p]; cp.splice(idx - 1, 1); return cp; });
  };

  // ─── Sheet tabs ────────────────────────────────────────────────────────────
  const saveCurrentSheet = (): void => {
    setSheets((prev) => {
      const cp = [...prev];
      cp[activeSheet] = { ...cp[activeSheet], cells, colWidths, styles, merges };
      return cp;
    });
  };
  const resetGridScroll = (): void => {
    const el = containerRef.current;
    if (el != null) { el.scrollTop = 0; el.scrollLeft = 0; }
  };
  const switchSheet = (idx: number): void => {
    if (idx === activeSheet) return;
    setIsSheetLoading(true);
    saveCurrentSheet();
    const target = sheets[idx];
    if (target != null) { setCells(target.cells); setColWidths(target.colWidths); setStyles(target.styles); setMerges(target.merges ?? []); }
    setActiveSheet(idx);
    setSelected(null); setCellMode('select'); setSelectionRange(null);
    resetGridScroll();
    setTimeout(() => setIsSheetLoading(false), 80);
  };
  const addSheet = (): void => {
    saveCurrentSheet();
    const newIdx = sheets.length;
    setSheets((prev) => [...prev, { name: `Sheet ${prev.length + 1}`, cells: {}, colWidths: [], rowHeights: [], styles: {}, merges: [], frozenRows: 0, frozenCols: 0 }]);
    // Switch to new sheet
    setCells({});
    setColWidths([]);
    setStyles({});
    setMerges([]);
    setActiveSheet(newIdx);
    setSelected(null);
    setCellMode('select');
    resetGridScroll();
  };
  const renameSheet = (idx: number, name: string): void => {
    setSheets((prev) => { const cp = [...prev]; cp[idx] = { ...cp[idx], name }; return cp; });
  };
  const deleteSheet = (idx: number): void => {
    if (sheets.length <= 1) { alert('At least one sheet is required'); return; }
    const newSheets = sheets.filter((_, i) => i !== idx);
    const newIdx = activeSheet >= newSheets.length ? newSheets.length - 1 : activeSheet > idx ? activeSheet - 1 : activeSheet;
    setSheets(newSheets);
    setActiveSheet(newIdx);
    const target = newSheets[newIdx];
    if (target != null) { setCells(target.cells); setColWidths(target.colWidths); setStyles(target.styles); setMerges(target.merges ?? []); }
    resetGridScroll();
  };

  // ─── Cell click / drag-to-select ───────────────────────────────────────────
  const gridRootRef = useRef<HTMLDivElement | null>(null);
  const onCellMouseDown = useCallback((r: number, c: number, shiftKey: boolean): void => {
    // Always go to select mode when pressing any cell
    setCellMode('select');

    if (shiftKey && anchorRef.current != null) {
      // Shift+Click extends the range from the existing anchor
      const anchor = anchorRef.current;
      setSelectionRange({
        r1: Math.min(anchor.r, r), c1: Math.min(anchor.c, c),
        r2: Math.max(anchor.r, r), c2: Math.max(anchor.c, c),
      });
      setSelected({ r, c });
    } else {
      setSelected({ r, c });
      // Clicking a merged cell should re-select the whole merge (not just its
      // top-left cell), so formatting operations like fill color apply to the
      // entire merged block instead of only the one underlying cell.
      const merge = findMergeAt(merges, r, c);
      setSelectionRange(merge != null ? { r1: merge.r1, c1: merge.c1, r2: merge.r2, c2: merge.c2 } : null);
      anchorRef.current = { r, c };
    }

    isMouseSelectingRef.current = true;
    // Ensure grid root has focus for keyboard navigation
    setTimeout(() => gridRootRef.current?.focus(), 0);
  }, [merges]);

  const onCellMouseEnter = useCallback((r: number, c: number): void => {
    // Extend the selection range while the mouse button is held down
    if (!isMouseSelectingRef.current || anchorRef.current == null) return;
    const anchor = anchorRef.current;
    setSelected({ r, c });
    setSelectionRange(
      anchor.r === r && anchor.c === c
        ? null
        : {
            r1: Math.min(anchor.r, r), c1: Math.min(anchor.c, c),
            r2: Math.max(anchor.r, r), c2: Math.max(anchor.c, c),
          }
    );
  }, []);

  useEffect(() => {
    const onMouseUp = (): void => { isMouseSelectingRef.current = false; };
    document.addEventListener('mouseup', onMouseUp);
    return () => document.removeEventListener('mouseup', onMouseUp);
  }, []);

  const onCellDoubleClick = useCallback((r: number, c: number): void => {
    setSelected({ r, c });
    setCellMode('edit');
    // Focus the cell input after render
    setTimeout(() => {
      (document.getElementById(`nova-cell-${r}-${c}`) as HTMLInputElement | null)?.focus();
    }, 0);
  }, []);

  // ─── Render ────────────────────────────────────────────────────────────────
  const { startRow, endRow, startCol, endCol, padTop, padBottom, padLeft, padRight } = virtualWindow;

  return (
    <div className={clsx(th.root, className)} ref={gridRootRef} onKeyDown={handleGridKeyDown} tabIndex={0} style={{ outline: 'none' }}>
      {/* Toolbar */}
      {showToolbar && !readOnly && (
        <NovaExcelToolbar
          onAddRow={addRow}
          onAddCol={addCol}
          onExport={exportCSV}
          onExportXlsx={exportXlsx}
          onImport={importFile}
          onInsertRowAbove={insertRowAbove}
          onInsertRowBelow={insertRowBelow}
          onInsertColBefore={insertColBefore}
          onInsertColAfter={insertColAfter}
          onDeleteRow={deleteRow}
          onDeleteCol={deleteCol}
          onStyleChange={(style) => {
            if (selected == null) return;
            pushUndo();
            setStyles((prev) => {
              const cp = { ...prev };
              const applyToCell = (r: number, c: number): void => {
                const k = keyOf(r, c);
                cp[k] = { ...(cp[k] ?? {}), ...style };
                Object.keys(cp[k]).forEach((key) => { if ((cp[k] as Record<string, unknown>)[key] === undefined) delete (cp[k] as Record<string, unknown>)[key]; });
              };
              if (selectionRange != null) {
                for (let r = selectionRange.r1; r <= selectionRange.r2; r++) {
                  for (let c = selectionRange.c1; c <= selectionRange.c2; c++) applyToCell(r, c);
                }
              } else if (selected.r > 0 && selected.c > 0) {
                applyToCell(selected.r, selected.c);
              } else if (selected.r > 0 && selected.c === 0) {
                // Entire row
                for (let c = 1; c <= dims.cols; c++) applyToCell(selected.r, c);
              } else if (selected.r === 0 && selected.c > 0) {
                // Entire column
                for (let r = 1; r <= dims.rows; r++) applyToCell(r, selected.c);
              }
              return cp;
            });
          }}
          onClearStyle={() => {
            if (selected == null) return;
            pushUndo();
            setStyles((prev) => {
              const cp = { ...prev };
              if (selectionRange != null) {
                for (let r = selectionRange.r1; r <= selectionRange.r2; r++) {
                  for (let c = selectionRange.c1; c <= selectionRange.c2; c++) delete cp[keyOf(r, c)];
                }
              } else if (selected.r > 0 && selected.c > 0) {
                delete cp[keyOf(selected.r, selected.c)];
              } else if (selected.r > 0 && selected.c === 0) {
                for (let c = 1; c <= dims.cols; c++) delete cp[keyOf(selected.r, c)];
              } else if (selected.r === 0 && selected.c > 0) {
                for (let r = 1; r <= dims.rows; r++) delete cp[keyOf(r, selected.c)];
              }
              return cp;
            });
          }}
          currentStyle={(() => {
            if (selected == null) return {};
            if (selected.r > 0 && selected.c > 0) return styles[keyOf(selected.r, selected.c)] ?? {};
            if (selected.r > 0 && selected.c === 0) return styles[keyOf(selected.r, 1)] ?? {};
            if (selected.r === 0 && selected.c > 0) return styles[keyOf(1, selected.c)] ?? {};
            return {};
          })()}
        />
      )}

      {/* Formula Bar */}
      {showFormulaBar && (
        <div className={th.formulaBar}>
          <span className={th.formulaCellRef}>{selected ? rcToLabel(selected.r, selected.c) : ''}</span>
          <span className={th.formulaLabel}>fx</span>
          <input
            className={th.formulaInput}
            value={formulaBarText}
            onChange={(e) => setFormulaBarText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && selected) { setCellValue(selected.r, selected.c, formulaBarText); setCellMode('select'); } }}
            placeholder="Enter value or formula (=SUM(A1:A5))"
            readOnly={readOnly}
          />
        </div>
      )}

      {/* Grid */}
      <div ref={containerRef} className={clsx(th.gridContainer, 'relative')} style={{ maxHeight }} onScroll={handleScroll}>
        {isSheetLoading && <div className={th.sheetLoader} />}
        <div style={{ minHeight: totalHeight + zoomedCellHeight, minWidth: totalWidth + 36 }}>
          <table className={th.table}>
            <colgroup>
              <col style={{ width: 36 }} />
              {Array.from({ length: endCol - startCol }, (_, i) => (
                <col key={i} style={{ width: zoomedColWidths[startCol + i] ?? zoomedDefaultColWidth }} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className={th.corner} style={{ height: zoomedCellHeight }} />
                {Array.from({ length: endCol - startCol }, (_, i) => {
                  const c = startCol + i + 1;
                  const isColSel = selected != null && selected.r === 0 && selected.c === c;
                  return (
                    <th key={c} className={clsx(th.colHeader, isColSel && th.colHeaderSelected)} style={{ height: zoomedCellHeight, fontSize: `${Math.max(8, 10 * zoomFactor)}px` }}
                      onClick={() => { setSelected({ r: 0, c }); setSelectionRange({ r1: 1, c1: c, r2: dims.rows, c2: c }); setCellMode('select'); setTimeout(() => gridRootRef.current?.focus(), 0); }}
                      onContextMenu={(e) => { e.preventDefault(); setContextMenu({ type: 'col', index: c, x: e.clientX, y: e.clientY }); }}
                    >
                      {colToLabel(c)}
                      <div className={th.colResizer} onMouseDown={(e) => onResizeStart(e, startCol + i)} />
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {padTop > 0 && <tr><td colSpan={endCol - startCol + 1} style={{ height: padTop, padding: 0, border: 'none' }} /></tr>}
              {Array.from({ length: endRow - startRow }, (_, ri) => {
                const r = startRow + ri + 1;
                const isRowSel = selected != null && selected.c === 0 && selected.r === r;
                return (
                  <tr key={r}>
                    <td className={clsx(th.rowHeader, isRowSel && th.rowHeaderSelected)} style={{ height: zoomedCellHeight, fontSize: `${Math.max(8, 10 * zoomFactor)}px` }}
                      onClick={() => { setSelected({ r, c: 0 }); setSelectionRange({ r1: r, c1: 1, r2: r, c2: dims.cols }); setCellMode('select'); setTimeout(() => gridRootRef.current?.focus(), 0); }}
                      onContextMenu={(e) => { e.preventDefault(); setContextMenu({ type: 'row', index: r, x: e.clientX, y: e.clientY }); }}
                    >
                      {r}
                    </td>
                    {Array.from({ length: endCol - startCol }, (_, ci) => {
                      const c = startCol + ci + 1;
                      const merge = findMergeAt(merges, r, c);
                      const isMergeTopLeft = merge != null && merge.r1 === r && merge.c1 === c;
                      const isMergeCovered = merge != null && !isMergeTopLeft;
                      // Covered cells act as the merge's top-left cell for click/select/edit purposes
                      const effR = isMergeCovered ? merge.r1 : r;
                      const effC = isMergeCovered ? merge.c1 : c;

                      const k = keyOf(r, c);
                      const raw = cells[k] ?? '';
                      const display = computed[k] ?? raw;
                      const isSel = selected?.r === r && selected?.c === c;
                      const isEdit = isSel && cellMode === 'edit';
                      const inRange = selectionRange != null && r >= selectionRange.r1 && r <= selectionRange.r2 && c >= selectionRange.c1 && c <= selectionRange.c2;
                      const fp = fillPreview;
                      const inFillPreview = fp != null && r >= fp.r1 && r <= fp.r2 && c >= fp.c1 && c <= fp.c2;

                      // Hide the shared internal border between cells of the same merge
                      const hideEndBorder = merge != null && c < merge.c2;
                      const hideBottomBorder = merge != null && r < merge.r2;

                      // Top-left cell of a multi-cell merge: compute the pixel size to visually
                      // span the whole merged rectangle (virtualization renders each <td> at its
                      // own column width, so the content overlays across the covered cells instead
                      // of using rowSpan/colSpan, which don't play well with windowed rendering).
                      let overlaySize: { width: number; height: number } | null = null;
                      if (isMergeTopLeft && merge != null && (merge.c2 > merge.c1 || merge.r2 > merge.r1)) {
                        let width = 0;
                        for (let cc = merge.c1; cc <= merge.c2; cc++) width += zoomedColWidths[cc - 1] ?? zoomedDefaultColWidth;
                        overlaySize = { width, height: (merge.r2 - merge.r1 + 1) * zoomedCellHeight };
                      }

                      return (
                        <td
                          key={c}
                          className={clsx(th.cell, isSel && overlaySize == null && (isEdit ? th.cellEditing : th.cellSelected), inRange && !isSel && th.cellInRange)}
                          style={{
                            height: zoomedCellHeight,
                            fontSize: `${Math.max(8, 11 * zoomFactor)}px`,
                            ...(styles[k] ?? {}),
                            ...(hideEndBorder ? { borderInlineEnd: 'none' } : {}),
                            ...(hideBottomBorder ? { borderBlockEnd: 'none' } : {}),
                          }}
                          onMouseDown={(e) => {
                            // Let native click/caret placement happen when clicking inside the cell being edited
                            if (isEdit) return;
                            // Right/middle click: leave selection alone so a right-click inside an
                            // existing range (e.g. to merge cells) doesn't collapse it to one cell.
                            if (e.button !== 0) return;
                            e.preventDefault();
                            onCellMouseDown(effR, effC, e.shiftKey);
                          }}
                          onMouseEnter={() => onCellMouseEnter(effR, effC)}
                          onDoubleClick={() => onCellDoubleClick(effR, effC)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            const withinRange = selectionRange != null && effR >= selectionRange.r1 && effR <= selectionRange.r2 && effC >= selectionRange.c1 && effC <= selectionRange.c2;
                            if (!withinRange) {
                              setSelected({ r: effR, c: effC });
                              setSelectionRange(null);
                              anchorRef.current = { r: effR, c: effC };
                            }
                            setCellContextMenu({ x: e.clientX, y: e.clientY });
                          }}
                        >
                          {isMergeCovered ? null : isEdit ? (
                            <input
                              id={`nova-cell-${r}-${c}`}
                              className={th.cellInput}
                              value={raw}
                              onChange={(e) => !readOnly && setCellValue(r, c, e.target.value)}
                              style={overlaySize != null ? { position: 'absolute', top: 0, left: 0, width: overlaySize.width, height: overlaySize.height, zIndex: 5 } : undefined}
                              autoFocus
                              onBlur={() => { setCellMode('select'); setTimeout(() => gridRootRef.current?.focus(), 0); }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  setCellMode('select');
                                  const nr = r + 1;
                                  ensureCellExists({ r: nr, c });
                                  setSelected({ r: nr, c });
                                  setTimeout(() => gridRootRef.current?.focus(), 0);
                                }
                                if (e.key === 'Tab') {
                                  e.preventDefault();
                                  setCellMode('select');
                                  const nc = c + 1;
                                  ensureCellExists({ r, c: nc });
                                  setSelected({ r, c: nc });
                                  setTimeout(() => gridRootRef.current?.focus(), 0);
                                }
                                if (e.key === 'Escape') {
                                  e.preventDefault();
                                  setCellMode('select');
                                  setTimeout(() => gridRootRef.current?.focus(), 0);
                                }
                                // In edit mode: arrows move cursor inside input (default behavior, don't prevent)
                              }}
                            />
                          ) : (
                            <>
                              <div
                                className={clsx(th.cellContent, styles[k]?.textAlign === 'center' && 'justify-center', styles[k]?.textAlign === 'right' && 'justify-end')}
                                style={overlaySize != null ? { position: 'absolute', top: 0, left: 0, width: overlaySize.width, height: overlaySize.height, zIndex: 5 } : undefined}
                              >
                                {String(display ?? '')}
                              </div>
                              {isSel && !readOnly && (
                                <div
                                  className={th.fillHandle}
                                  onMouseDown={onFillHandleMouseDown}
                                  style={overlaySize != null ? { bottom: 'auto', insetInlineEnd: 'auto', left: overlaySize.width - 4, top: overlaySize.height - 4 } : undefined}
                                />
                              )}
                            </>
                          )}
                          {isSel && overlaySize != null && (
                            <div
                              className={isEdit ? th.cellEditing : th.cellSelected}
                              style={{ position: 'absolute', top: 0, left: 0, width: overlaySize.width, height: overlaySize.height, zIndex: 10, pointerEvents: 'none' }}
                            />
                          )}
                          {inFillPreview && fp != null && !isMergeCovered && (
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              ...(overlaySize != null ? { width: overlaySize.width, height: overlaySize.height } : { right: 0, bottom: 0 }),
                              zIndex: 15,
                              pointerEvents: 'none',
                              backgroundColor: 'color-mix(in srgb, var(--color-primary) 5%, transparent)',
                              borderTop: r === fp.r1 ? '2px dashed color-mix(in srgb, var(--color-primary) 60%, transparent)' : undefined,
                              borderBottom: r === fp.r2 ? '2px dashed color-mix(in srgb, var(--color-primary) 60%, transparent)' : undefined,
                              borderLeft: c === fp.c1 ? '2px dashed color-mix(in srgb, var(--color-primary) 60%, transparent)' : undefined,
                              borderRight: c === fp.c2 ? '2px dashed color-mix(in srgb, var(--color-primary) 60%, transparent)' : undefined,
                            }} />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {padBottom > 0 && <tr><td colSpan={endCol - startCol + 1} style={{ height: padBottom, padding: 0, border: 'none' }} /></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer / Sheet Tabs */}
      {showSheetTabs && (
        <NovaExcelSheetTabs
          sheets={sheets}
          activeSheet={activeSheet}
          onSwitchSheet={switchSheet}
          onAddSheet={addSheet}
          onRenameSheet={renameSheet}
          onDeleteSheet={deleteSheet}
          zoom={zoom}
          onZoomChange={setZoom}
          selectedCell={selected ? rcToLabel(selected.r, selected.c) : null}
          selectionStats={selectionStats}
        />
      )}
      {!showSheetTabs && (
        <div className={th.footer}>
          <span className={th.footerInfo}>
            {selected ? rcToLabel(selected.r, selected.c) : 'Ready'}
          </span>
          {selectionStats != null && selectionStats.count > 1 && (
            <span className={th.footerInfo}>
              Count: {selectionStats.count}
              {selectionStats.numericCount > 0 && (
                <>
                  {'  '}Sum: {formatStat(selectionStats.sum)}
                  {'  '}Average: {formatStat(selectionStats.average)}
                </>
              )}
            </span>
          )}
        </div>
      )}

      {/* Context Menu (col/row) */}
      {contextMenu != null && contextMenu.type !== 'sheet' && (
        <NovaExcelContextMenu
          type={contextMenu.type as 'row' | 'col'}
          index={contextMenu.index}
          x={contextMenu.x}
          y={contextMenu.y}
          hasFilter={filterEnabled[contextMenu.index] ?? false}
          onAction={(action: ContextAction) => {
            const idx = contextMenu.index;
            pushUndo();
            if (contextMenu.type === 'row') {
              if (action === 'insertAbove') {
                setCells((prev) => { const cp: CellsMap = {}; for (const [k, v] of Object.entries(prev)) { const m = k.match(/^r(\d+)c(\d+)$/); if (!m) { cp[k] = v; continue; } const r = Number(m[1]); const c = Number(m[2]); if (r < idx) cp[k] = v; else cp[keyOf(r + 1, c)] = v; } return cp; });
                setStyles((prev) => shiftMapRowInsert(prev, idx, true));
                setMerges((prev) => insertRowIntoMerges(prev, idx, true));
                setDims((d) => ({ ...d, rows: d.rows + 1 }));
              } else if (action === 'insertBelow') {
                setCells((prev) => { const cp: CellsMap = {}; for (const [k, v] of Object.entries(prev)) { const m = k.match(/^r(\d+)c(\d+)$/); if (!m) { cp[k] = v; continue; } const r = Number(m[1]); const c = Number(m[2]); if (r <= idx) cp[k] = v; else cp[keyOf(r + 1, c)] = v; } return cp; });
                setStyles((prev) => shiftMapRowInsert(prev, idx, false));
                setMerges((prev) => insertRowIntoMerges(prev, idx, false));
                setDims((d) => ({ ...d, rows: d.rows + 1 }));
              } else if (action === 'delete') {
                setCells((prev) => { const cp: CellsMap = {}; for (const [k, v] of Object.entries(prev)) { const m = k.match(/^r(\d+)c(\d+)$/); if (!m) { cp[k] = v; continue; } const r = Number(m[1]); const c = Number(m[2]); if (r < idx) cp[k] = v; else if (r > idx) cp[keyOf(r - 1, c)] = v; } return cp; });
                setStyles((prev) => shiftMapRowDelete(prev, idx));
                setMerges((prev) => deleteRowFromMerges(prev, idx));
                setDims((d) => ({ ...d, rows: Math.max(1, d.rows - 1) }));
              } else if (action === 'copy') {
                const rowData: string[] = []; for (let c = 1; c <= dims.cols; c++) rowData.push(cells[keyOf(idx, c)] ?? '');
                internalClipboard.current = { type: 'row', index: idx, data: rowData };
                void navigator.clipboard.writeText(rowData.join('\t')).catch(() => {});
              } else if (action === 'cut') {
                const rowData: string[] = []; for (let c = 1; c <= dims.cols; c++) rowData.push(cells[keyOf(idx, c)] ?? '');
                internalClipboard.current = { type: 'row', index: idx, data: rowData };
                void navigator.clipboard.writeText(rowData.join('\t')).catch(() => {});
                setCells((prev) => { const cp = { ...prev }; for (let c = 1; c <= dims.cols; c++) delete cp[keyOf(idx, c)]; return cp; });
              } else if (action === 'paste') {
                pushUndo();
                const clip = internalClipboard.current;
                if (clip != null) {
                  setCells((prev) => {
                    const cp = { ...prev };
                    if (clip.type === 'row') {
                      clip.data.forEach((v, i) => { if (v) cp[keyOf(idx, i + 1)] = v; else delete cp[keyOf(idx, i + 1)]; });
                    } else {
                      clip.data.forEach((v, i) => { if (v) cp[keyOf(i + 1, idx)] = v; else delete cp[keyOf(i + 1, idx)]; });
                    }
                    return cp;
                  });
                }
              }
            } else {
              if (action === 'insertBefore') {
                setCells((prev) => { const cp: CellsMap = {}; for (const [k, v] of Object.entries(prev)) { const m = k.match(/^r(\d+)c(\d+)$/); if (!m) { cp[k] = v; continue; } const r = Number(m[1]); const c = Number(m[2]); if (c < idx) cp[k] = v; else cp[keyOf(r, c + 1)] = v; } return cp; });
                setStyles((prev) => shiftMapColInsert(prev, idx, true));
                setMerges((prev) => insertColIntoMerges(prev, idx, true));
                setDims((d) => ({ ...d, cols: d.cols + 1 })); setColWidths((p) => { const cp = [...p]; cp.splice(idx - 1, 0, defaultColWidth); return cp; });
              } else if (action === 'insertAfter') {
                setCells((prev) => { const cp: CellsMap = {}; for (const [k, v] of Object.entries(prev)) { const m = k.match(/^r(\d+)c(\d+)$/); if (!m) { cp[k] = v; continue; } const r = Number(m[1]); const c = Number(m[2]); if (c <= idx) cp[k] = v; else cp[keyOf(r, c + 1)] = v; } return cp; });
                setStyles((prev) => shiftMapColInsert(prev, idx, false));
                setMerges((prev) => insertColIntoMerges(prev, idx, false));
                setDims((d) => ({ ...d, cols: d.cols + 1 })); setColWidths((p) => { const cp = [...p]; cp.splice(idx, 0, defaultColWidth); return cp; });
              } else if (action === 'delete') {
                setCells((prev) => { const cp: CellsMap = {}; for (const [k, v] of Object.entries(prev)) { const m = k.match(/^r(\d+)c(\d+)$/); if (!m) { cp[k] = v; continue; } const r = Number(m[1]); const c = Number(m[2]); if (c < idx) cp[k] = v; else if (c > idx) cp[keyOf(r, c - 1)] = v; } return cp; });
                setStyles((prev) => shiftMapColDelete(prev, idx));
                setMerges((prev) => deleteColFromMerges(prev, idx));
                setDims((d) => ({ ...d, cols: Math.max(1, d.cols - 1) })); setColWidths((p) => { const cp = [...p]; cp.splice(idx - 1, 1); return cp; });
              } else if (action === 'copy') {
                const colData: string[] = []; for (let r = 1; r <= dims.rows; r++) colData.push(cells[keyOf(r, idx)] ?? '');
                internalClipboard.current = { type: 'col', index: idx, data: colData };
                void navigator.clipboard.writeText(colData.join('\n')).catch(() => {});
              } else if (action === 'cut') {
                const colData: string[] = []; for (let r = 1; r <= dims.rows; r++) colData.push(cells[keyOf(r, idx)] ?? '');
                internalClipboard.current = { type: 'col', index: idx, data: colData };
                void navigator.clipboard.writeText(colData.join('\n')).catch(() => {});
                setCells((prev) => { const cp = { ...prev }; for (let r = 1; r <= dims.rows; r++) delete cp[keyOf(r, idx)]; return cp; });
              } else if (action === 'paste') {
                pushUndo();
                const clip = internalClipboard.current;
                if (clip != null) {
                  setCells((prev) => {
                    const cp = { ...prev };
                    if (clip.type === 'col') {
                      clip.data.forEach((v, i) => { if (v) cp[keyOf(i + 1, idx)] = v; else delete cp[keyOf(i + 1, idx)]; });
                    } else {
                      clip.data.forEach((v, i) => { if (v) cp[keyOf(idx, i + 1)] = v; else delete cp[keyOf(idx, i + 1)]; });
                    }
                    return cp;
                  });
                }
              } else if (action === 'filter') {
                setFilterEnabled((prev) => ({ ...prev, [idx]: !prev[idx] }));
                if (filterForCol[idx]) setFilterForCol((prev) => { const cp = { ...prev }; delete cp[idx]; return cp; });
              }
            }
            setContextMenu(null);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Context Menu (data cells — merge/unmerge) */}
      {cellContextMenu != null && (() => {
        const activeMerge = selected != null ? findMergeAt(merges, selected.r, selected.c) : null;
        const canMerge = selectionRange != null && (selectionRange.r1 !== selectionRange.r2 || selectionRange.c1 !== selectionRange.c2);
        const canUnmerge = activeMerge != null;
        if (!canMerge && !canUnmerge) return null;

        return createPortal(
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setCellContextMenu(null)} onContextMenu={(e) => { e.preventDefault(); setCellContextMenu(null); }} />
            <div className={th.contextMenu} style={{ top: cellContextMenu.y, left: cellContextMenu.x }}>
              {canMerge && (
                <div className={th.contextMenuItem} onClick={() => { mergeCells(); setCellContextMenu(null); }}>
                  Merge Cells
                </div>
              )}
              {canUnmerge && (
                <div className={th.contextMenuItem} onClick={() => { unmergeCells(); setCellContextMenu(null); }}>
                  Unmerge Cells
                </div>
              )}
            </div>
          </>,
          document.body
        );
      })()}
    </div>
  );
}
