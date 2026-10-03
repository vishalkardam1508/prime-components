import { useCallback, useRef } from 'react';
import type { UndoSnapshot } from '../types/novaExcel.types';

interface UseNovaExcelUndoReturn {
  pushSnapshot: (snapshot: UndoSnapshot) => void;
  undo: () => UndoSnapshot | null;
  redo: () => UndoSnapshot | null;
}

const MAX_STACK = 100;

export function useNovaExcelUndo(): UseNovaExcelUndoReturn {
  const undoStack = useRef<UndoSnapshot[]>([]);
  const redoStack = useRef<UndoSnapshot[]>([]);

  const pushSnapshot = useCallback((snapshot: UndoSnapshot): void => {
    undoStack.current.push({ ...snapshot, cells: { ...snapshot.cells }, colWidths: [...snapshot.colWidths], styles: { ...snapshot.styles }, merges: [...snapshot.merges] });
    if (undoStack.current.length > MAX_STACK) undoStack.current.shift();
    // Clear redo on new action
    redoStack.current = [];
  }, []);

  const undo = useCallback((): UndoSnapshot | null => {
    return undoStack.current.pop() ?? null;
  }, []);

  const redo = useCallback((): UndoSnapshot | null => {
    return redoStack.current.pop() ?? null;
  }, []);

  return { pushSnapshot, undo, redo };
}
