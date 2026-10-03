import { useCallback } from 'react';
import type { CellPosition, CellMode, SelectionRange, GridDimensions } from '../types/novaExcel.types';

interface Props {
  dims: GridDimensions;
  selected: CellPosition | null;
  setSelected: (pos: CellPosition) => void;
  cellMode: CellMode;
  setCellMode: (mode: CellMode) => void;
  selectionRange: SelectionRange | null;
  setSelectionRange: (range: SelectionRange | null) => void;
  anchorRef: React.MutableRefObject<CellPosition | null>;
  onUndo: () => void;
  onRedo: () => void;
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onStartEdit: (char: string) => void;
  ensureCellExists: (pos: CellPosition) => void;
  commitEdit: () => void;
}

export function useNovaExcelKeyboard({
  dims,
  selected,
  setSelected,
  cellMode,
  setCellMode,
  setSelectionRange,
  anchorRef,
  onUndo,
  onRedo,
  onCopy,
  onCut,
  onPaste,
  onStartEdit,
  ensureCellExists,
  commitEdit,
}: Props): {
  handleGridKeyDown: (e: React.KeyboardEvent) => void;
} {
  const handleGridKeyDown = useCallback((e: React.KeyboardEvent): void => {
    if (selected == null) return;
    const { r, c } = selected;

    // Ctrl/Cmd shortcuts (work in both modes)
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 'z') { e.preventDefault(); onUndo(); return; }
      if (e.key.toLowerCase() === 'y') { e.preventDefault(); onRedo(); return; }
      if (e.key.toLowerCase() === 'c') { e.preventDefault(); void onCopy(); return; }
      if (e.key.toLowerCase() === 'x') { e.preventDefault(); onCut(); return; }
      if (e.key.toLowerCase() === 'v') { e.preventDefault(); void onPaste(); return; }
      return;
    }

    // ─── SELECT MODE ─────────────────────────────────────────────────────
    if (cellMode === 'select') {
      // F2 → enter edit mode
      if (e.key === 'F2') {
        e.preventDefault();
        setCellMode('edit');
        return;
      }

      // Arrow keys → navigate
      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        let nr = r;
        let nc = c;
        if (e.key === 'ArrowUp') nr = Math.max(1, r - 1);
        if (e.key === 'ArrowDown') nr = r + 1;
        if (e.key === 'ArrowLeft') nc = Math.max(1, c - 1);
        if (e.key === 'ArrowRight') nc = c + 1;

        const newPos = { r: nr, c: nc };
        ensureCellExists(newPos);

        if (e.shiftKey) {
          if (anchorRef.current == null) anchorRef.current = { r, c };
          const anchor = anchorRef.current;
          setSelectionRange({
            r1: Math.min(anchor.r, nr), c1: Math.min(anchor.c, nc),
            r2: Math.max(anchor.r, nr), c2: Math.max(anchor.c, nc),
          });
        } else {
          anchorRef.current = null;
          setSelectionRange(null);
        }
        setSelected(newPos);
        return;
      }

      // Tab → move right
      if (e.key === 'Tab') {
        e.preventDefault();
        const nc = c + 1;
        const newPos = { r, c: nc };
        ensureCellExists(newPos);
        setSelected(newPos);
        setSelectionRange(null);
        return;
      }

      // Enter → move down
      if (e.key === 'Enter') {
        e.preventDefault();
        const nr = r + 1;
        const newPos = { r: nr, c };
        ensureCellExists(newPos);
        setSelected(newPos);
        setSelectionRange(null);
        return;
      }

      // Delete/Backspace → clear cell
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        commitEdit();
        return;
      }

      // Any printable character → enter edit mode and start typing
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        onStartEdit(e.key);
        setCellMode('edit');
        setTimeout(() => {
          const input = document.getElementById(`nova-cell-${r}-${c}`) as HTMLInputElement | null;
          input?.focus();
          input?.setSelectionRange(input.value.length, input.value.length);
        }, 0);
        return;
      }

      // Escape → deselect
      if (e.key === 'Escape') {
        setSelectionRange(null);
        return;
      }
    }

    // ─── EDIT MODE ───────────────────────────────────────────────────────
    if (cellMode === 'edit') {
      // Enter → commit and move down
      if (e.key === 'Enter') {
        e.preventDefault();
        setCellMode('select');
        const nr = r + 1;
        const newPos = { r: nr, c };
        ensureCellExists(newPos);
        setSelected(newPos);
        return;
      }

      // Tab → commit and move right
      if (e.key === 'Tab') {
        e.preventDefault();
        setCellMode('select');
        const nc = c + 1;
        const newPos = { r, c: nc };
        ensureCellExists(newPos);
        setSelected(newPos);
        return;
      }

      // Escape → cancel edit, back to select
      if (e.key === 'Escape') {
        e.preventDefault();
        setCellMode('select');
        return;
      }

      // In edit mode, arrows move text cursor (don't prevent default)
    }
  }, [selected, cellMode, dims, setCellMode, setSelected, setSelectionRange, anchorRef, onUndo, onRedo, onCopy, onCut, onPaste, onStartEdit, ensureCellExists, commitEdit]);

  return { handleGridKeyDown };
}
