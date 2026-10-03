import { useCallback, useEffect } from 'react';
import type { CellsMap, CellPosition, SelectionRange } from '../types/novaExcel.types';
import { keyOf } from '../utils/novaExcel.helpers';

interface UseNovaExcelClipboardProps {
  cells: CellsMap;
  selected: CellPosition | null;
  selectionRange: SelectionRange | null;
  setCells: React.Dispatch<React.SetStateAction<CellsMap>>;
  pushUndo: () => void;
}

export function useNovaExcelClipboard({
  cells,
  selected,
  selectionRange,
  setCells,
  pushUndo,
}: UseNovaExcelClipboardProps): { copy: () => void } {
  const copy = useCallback(async (): Promise<void> => {
    let text = '';
    if (selectionRange != null) {
      const { r1, c1, r2, c2 } = selectionRange;
      const rows: string[] = [];
      for (let r = r1; r <= r2; r++) {
        const cols: string[] = [];
        for (let c = c1; c <= c2; c++) {
          cols.push(cells[keyOf(r, c)] ?? '');
        }
        rows.push(cols.join('\t'));
      }
      text = rows.join('\n');
    } else if (selected != null && selected.r > 0 && selected.c > 0) {
      text = cells[keyOf(selected.r, selected.c)] ?? '';
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  }, [cells, selected, selectionRange]);

  // Paste handler
  useEffect(() => {
    const onPaste = (ev: ClipboardEvent): void => {
      const active = document.activeElement as HTMLElement | null;
      // Don't intercept if user is typing in a cell input
      if (active?.tagName === 'INPUT' && active.classList.contains('nova-cell-input')) return;

      const data = ev.clipboardData?.getData('text');
      if (data == null || data === '') return;
      ev.preventDefault();

      const startR = selectionRange?.r1 ?? selected?.r ?? 1;
      const startC = selectionRange?.c1 ?? selected?.c ?? 1;
      if (startR <= 0 || startC <= 0) return;

      pushUndo();
      const rowsText = data.split(/\r\n|\n/);
      setCells((prev) => {
        const cp = { ...prev };
        for (let i = 0; i < rowsText.length; i++) {
          const colsText = rowsText[i].split('\t');
          for (let j = 0; j < colsText.length; j++) {
            const r = startR + i;
            const c = startC + j;
            const v = colsText[j];
            if (v === '') delete cp[keyOf(r, c)];
            else cp[keyOf(r, c)] = v;
          }
        }
        return cp;
      });
    };

    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [selected, selectionRange, setCells, pushUndo]);

  return { copy };
}
