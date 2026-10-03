import { useCallback, useEffect, useRef, useState } from 'react';
import type { CellPosition, CellsMap, SelectionRange } from '../types/novaExcel.types';
import { keyOf } from '../utils/novaExcel.helpers';
import { detectPattern, generateFillValues } from '../utils/novaExcel.autofill';

interface Props {
  selected: CellPosition | null;
  selectionRange: SelectionRange | null;
  cells: CellsMap;
  dims: { rows: number; cols: number };
  cellHeight: number;
  colWidths: number[];
  defaultColWidth: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  setCells: React.Dispatch<React.SetStateAction<CellsMap>>;
  pushUndo: () => void;
}

export interface FillPreview {
  r1: number; c1: number; r2: number; c2: number;
  direction: 'down' | 'up' | 'right' | 'left';
}

export function useNovaExcelFillHandle({
  selected,
  selectionRange,
  cells,
  dims,
  cellHeight,
  colWidths,
  defaultColWidth,
  containerRef,
  setCells,
  pushUndo,
}: Props): {
  fillPreview: FillPreview | null;
  onFillHandleMouseDown: (e: React.MouseEvent) => void;
} {
  const [fillPreview, setFillPreview] = useState<FillPreview | null>(null);
  const fillPreviewRef = useRef<FillPreview | null>(null);
  const fillRafRef = useRef<number | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const baseRange = useRef<SelectionRange | null>(null);

  useEffect(() => {
    setFillPreview(null);
    fillPreviewRef.current = null;
    startPos.current = null;
  }, [selected]);

  const getBaseRange = useCallback((): SelectionRange | null => {
    if (selectionRange != null) return selectionRange;
    if (selected != null && selected.r > 0 && selected.c > 0) {
      return { r1: selected.r, c1: selected.c, r2: selected.r, c2: selected.c };
    }
    return null;
  }, [selected, selectionRange]);

  const onFillHandleMouseDown = useCallback((e: React.MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    const range = getBaseRange();
    if (range == null) return;

    startPos.current = { x: e.clientX, y: e.clientY };
    baseRange.current = range;

    const onMouseMove = (ev: MouseEvent): void => {
      if (startPos.current == null || baseRange.current == null) return;
      const dx = ev.clientX - startPos.current.x;
      const dy = ev.clientY - startPos.current.y;
      const br = baseRange.current;

      let newPreview: FillPreview | null = null;

      // Determine primary direction
      if (Math.abs(dy) >= Math.abs(dx)) {
        // Vertical
        const cellsMoved = Math.round(dy / cellHeight);
        if (cellsMoved > 0) {
          const r2 = Math.min(dims.rows, br.r2 + cellsMoved);
          if (r2 > br.r2) newPreview = { r1: br.r2 + 1, c1: br.c1, r2, c2: br.c2, direction: 'down' };
        } else if (cellsMoved < 0) {
          const r1 = Math.max(1, br.r1 + cellsMoved);
          if (r1 < br.r1) newPreview = { r1, c1: br.c1, r2: br.r1 - 1, c2: br.c2, direction: 'up' };
        }
      } else {
        // Horizontal
        const avgColWidth = colWidths.length > 0
          ? colWidths.reduce((s, w) => s + w, 0) / colWidths.length
          : defaultColWidth;
        const cellsMoved = Math.round(dx / avgColWidth);
        if (cellsMoved > 0) {
          const c2 = Math.min(dims.cols, br.c2 + cellsMoved);
          if (c2 > br.c2) newPreview = { r1: br.r1, c1: br.c2 + 1, r2: br.r2, c2, direction: 'right' };
        } else if (cellsMoved < 0) {
          const c1 = Math.max(1, br.c1 + cellsMoved);
          if (c1 < br.c1) newPreview = { r1: br.r1, c1, r2: br.r2, c2: br.c1 - 1, direction: 'left' };
        }
      }

      fillPreviewRef.current = newPreview;
      if (fillRafRef.current != null) cancelAnimationFrame(fillRafRef.current);
      fillRafRef.current = requestAnimationFrame(() => {
        setFillPreview(fillPreviewRef.current);
        fillRafRef.current = null;
      });
    };

    const onMouseUp = (): void => {
      if (fillRafRef.current != null) { cancelAnimationFrame(fillRafRef.current); fillRafRef.current = null; }
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      const preview = fillPreviewRef.current;
      const br = baseRange.current;
      if (preview == null || br == null) { setFillPreview(null); fillPreviewRef.current = null; startPos.current = null; return; }

      // Execute fill
      pushUndo();
      executeFill(br, preview);
      setFillPreview(null);
      fillPreviewRef.current = null;
      startPos.current = null;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [getBaseRange, cellHeight, colWidths, defaultColWidth, dims, pushUndo]);

  const executeFill = useCallback((br: SelectionRange, preview: FillPreview): void => {
    setCells((prev) => {
      const cp = { ...prev };
      const { direction } = preview;

      if (direction === 'down' || direction === 'up') {
        // Fill column by column
        for (let c = br.c1; c <= br.c2; c++) {
          const sourceValues: string[] = [];
          for (let r = br.r1; r <= br.r2; r++) sourceValues.push(prev[keyOf(r, c)] ?? '');
          const pattern = detectPattern(sourceValues);
          const count = direction === 'down' ? preview.r2 - br.r2 : br.r1 - preview.r1;
          const dir = direction === 'down' ? 1 : -1;
          const filled = generateFillValues(pattern, count, dir);

          for (let i = 0; i < filled.length; i++) {
            const r = direction === 'down' ? br.r2 + 1 + i : br.r1 - 1 - i;
            if (filled[i] !== '') cp[keyOf(r, c)] = filled[i];
            else delete cp[keyOf(r, c)];
          }
        }
      } else {
        // Fill row by row
        for (let r = br.r1; r <= br.r2; r++) {
          const sourceValues: string[] = [];
          for (let c = br.c1; c <= br.c2; c++) sourceValues.push(prev[keyOf(r, c)] ?? '');
          const pattern = detectPattern(sourceValues);
          const count = direction === 'right' ? preview.c2 - br.c2 : br.c1 - preview.c1;
          const dir = direction === 'right' ? 1 : -1;
          const filled = generateFillValues(pattern, count, dir);

          for (let i = 0; i < filled.length; i++) {
            const c = direction === 'right' ? br.c2 + 1 + i : br.c1 - 1 - i;
            if (filled[i] !== '') cp[keyOf(r, c)] = filled[i];
            else delete cp[keyOf(r, c)];
          }
        }
      }
      return cp;
    });
  }, [setCells]);

  return { fillPreview, onFillHandleMouseDown };
}
