import { useCallback } from 'react';
import type { GridDimensions, CellPosition } from '../types/novaExcel.types';

const EXPAND_ROWS = 50;
const EXPAND_COLS = 10;

interface Props {
  dims: GridDimensions;
  setDims: React.Dispatch<React.SetStateAction<GridDimensions>>;
}

export function useNovaExcelAutoExpand({ dims, setDims }: Props): {
  ensureCellExists: (pos: CellPosition) => void;
  expandOnScrollEdge: (endRow: number, endCol: number) => void;
} {
  /** Ensure the grid is large enough to contain the given position */
  const ensureCellExists = useCallback((pos: CellPosition): void => {
    let changed = false;
    let newRows = dims.rows;
    let newCols = dims.cols;

    if (pos.r >= dims.rows) {
      newRows = pos.r + EXPAND_ROWS;
      changed = true;
    }
    if (pos.c >= dims.cols) {
      newCols = pos.c + EXPAND_COLS;
      changed = true;
    }

    if (changed) {
      setDims({ rows: newRows, cols: newCols });
    }
  }, [dims, setDims]);

  /** Called from virtual scroll — if user scrolls near the bottom edge, expand rows */
  const expandOnScrollEdge = useCallback((endRow: number, _endCol: number): void => {
    if (endRow >= dims.rows - 10) {
      setDims((prev) => ({ ...prev, rows: prev.rows + EXPAND_ROWS }));
    }
  }, [dims.rows, setDims]);

  return { ensureCellExists, expandOnScrollEdge };
}
