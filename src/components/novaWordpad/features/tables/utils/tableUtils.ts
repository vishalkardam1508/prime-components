import { closestTag } from '../../../core/dom/traverse';
import type { SelectionService } from '../../editor/types/editor.types';

export function getCellAtCaret(root: HTMLElement | null, selectionService: SelectionService): HTMLTableCellElement | null {
  const range = selectionService.getRange();
  if (!range) return null;
  return closestTag(range.startContainer, ['TD', 'TH'], root) as HTMLTableCellElement | null;
}

export function getRowAtCaret(root: HTMLElement | null, selectionService: SelectionService): HTMLTableRowElement | null {
  const cell = getCellAtCaret(root, selectionService);
  return cell ? cell.closest('tr') : null;
}

export function getTableAtCaret(root: HTMLElement | null, selectionService: SelectionService): HTMLTableElement | null {
  const cell = getCellAtCaret(root, selectionService);
  return cell ? cell.closest('table') : null;
}

/** Builds a new <table> with the given dimensions, filled with empty cells. */
export function buildTable(rows: number, cols: number): HTMLTableElement {
  const table = document.createElement('table');
  const tbody = document.createElement('tbody');
  for (let r = 0; r < rows; r += 1) {
    const tr = document.createElement('tr');
    for (let c = 0; c < cols; c += 1) {
      const td = document.createElement('td');
      td.innerHTML = '<br>';
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  return table;
}
