import { useCallback, useRef } from 'react';

const MIN_COL_WIDTH = 30;
const MAX_COL_WIDTH = 600;

interface Props {
  colWidths: number[];
  setColWidths: React.Dispatch<React.SetStateAction<number[]>>;
  defaultColWidth: number;
}

export function useNovaExcelResize({ setColWidths, defaultColWidth }: Props): {
  onResizeStart: (e: React.MouseEvent, colIndex: number) => void;
} {
  const resizerRef = useRef<{ startX: number; colIndex: number } | null>(null);

  const onResizeStart = useCallback((e: React.MouseEvent, colIndex: number): void => {
    e.preventDefault();
    e.stopPropagation();
    resizerRef.current = { startX: e.clientX, colIndex };

    const onMove = (ev: MouseEvent): void => {
      if (resizerRef.current == null) return;
      const delta = ev.clientX - resizerRef.current.startX;
      setColWidths((prev) => {
        const cp = [...prev];
        while (cp.length <= resizerRef.current!.colIndex) cp.push(defaultColWidth);
        const next = (cp[resizerRef.current!.colIndex] ?? defaultColWidth) + delta;
        cp[resizerRef.current!.colIndex] = Math.min(MAX_COL_WIDTH, Math.max(MIN_COL_WIDTH, next));
        return cp;
      });
      resizerRef.current.startX = ev.clientX;
    };

    const onUp = (): void => {
      resizerRef.current = null;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
    };

    document.body.style.cursor = 'col-resize';
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [setColWidths, defaultColWidth]);

  return { onResizeStart };
}
