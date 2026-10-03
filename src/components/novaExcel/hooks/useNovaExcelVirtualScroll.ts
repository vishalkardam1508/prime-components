import { useCallback, useRef, useState } from 'react';
import type { VirtualWindow, GridDimensions } from '../types/novaExcel.types';

interface Props {
  dims: GridDimensions;
  cellHeight: number;
  colWidths: number[];
  defaultColWidth: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useNovaExcelVirtualScroll({
  dims,
  cellHeight,
  colWidths,
  defaultColWidth,
  containerRef,
}: Props): {
  virtualWindow: VirtualWindow;
  handleScroll: () => void;
  totalWidth: number;
  totalHeight: number;
} {
  const [virtualWindow, setVirtualWindow] = useState<VirtualWindow>({
    startRow: 0, endRow: 50, startCol: 0, endCol: dims.cols,
    padTop: 0, padBottom: 0, padLeft: 0, padRight: 0,
  });

  const rafRef = useRef<number | null>(null);

  const totalHeight = dims.rows * cellHeight;

  // Sum all column widths
  const totalWidth = (() => {
    let sum = 0;
    for (let i = 0; i < dims.cols; i++) {
      sum += colWidths[i] ?? defaultColWidth;
    }
    return sum;
  })();

  const handleScroll = useCallback((): void => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      const el = containerRef.current;
      if (el == null) { rafRef.current = null; return; }

      const scrollTop = el.scrollTop;
      const viewHeight = el.clientHeight;

      const overscanRows = 10;

      // Rows only — no horizontal virtualization
      const startRow = Math.max(0, Math.floor(scrollTop / cellHeight) - overscanRows);
      const visibleRows = Math.ceil(viewHeight / cellHeight) + overscanRows * 2;
      const endRow = Math.min(dims.rows, startRow + visibleRows);

      const padTop = startRow * cellHeight;
      const padBottom = Math.max(0, (dims.rows - endRow) * cellHeight);

      // All columns rendered — no horizontal virtualization
      const startCol = 0;
      const endCol = dims.cols;

      setVirtualWindow((prev) => {
        if (prev.startRow === startRow && prev.endRow === endRow && prev.startCol === startCol && prev.endCol === endCol) return prev;
        return { startRow, endRow, startCol, endCol, padTop, padBottom, padLeft: 0, padRight: 0 };
      });

      rafRef.current = null;
    });
  }, [dims, cellHeight, containerRef]);

  return { virtualWindow, handleScroll, totalWidth, totalHeight };
}
