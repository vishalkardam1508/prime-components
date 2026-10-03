import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';
import { getCellAtCaret, getRowAtCaret, getTableAtCaret } from '../utils/tableUtils';

export const addRowCommand: Omit<CommandDefinition<EditorCommandContext, undefined, void>, 'id'> = {
  label: 'Add Row',
  execute({ editorService, selectionService }) {
    const root = editorService.getRoot();
    const row = getRowAtCaret(root, selectionService);
    if (!row) return;
    const newRow = row.cloneNode(true) as HTMLTableRowElement;
    Array.from(newRow.children).forEach((cell) => {
      cell.innerHTML = '<br>';
    });
    row.after(newRow);
    editorService.normalize();
  }
};

export const deleteRowCommand: Omit<CommandDefinition<EditorCommandContext, undefined, void>, 'id'> = {
  label: 'Delete Row',
  execute({ editorService, selectionService }) {
    const root = editorService.getRoot();
    const row = getRowAtCaret(root, selectionService);
    const table = getTableAtCaret(root, selectionService);
    if (!row || !table) return;
    if (table.querySelectorAll('tr').length <= 1) {
      table.remove();
    } else {
      row.remove();
    }
    editorService.normalize();
  }
};

export const addColumnCommand: Omit<CommandDefinition<EditorCommandContext, undefined, void>, 'id'> = {
  label: 'Add Column',
  execute({ editorService, selectionService }) {
    const root = editorService.getRoot();
    const cell = getCellAtCaret(root, selectionService);
    const table = getTableAtCaret(root, selectionService);
    if (!cell || !table || !cell.parentElement) return;
    const cellIndex = Array.from(cell.parentElement.children).indexOf(cell);
    table.querySelectorAll('tr').forEach((tr) => {
      if (cellIndex >= tr.children.length) return;
      const reference = tr.children[cellIndex];
      const newCell = document.createElement(reference.tagName);
      newCell.innerHTML = '<br>';
      reference.after(newCell);
    });
    editorService.normalize();
  }
};

export const deleteColumnCommand: Omit<CommandDefinition<EditorCommandContext, undefined, void>, 'id'> = {
  label: 'Delete Column',
  execute({ editorService, selectionService }) {
    const root = editorService.getRoot();
    const cell = getCellAtCaret(root, selectionService);
    const table = getTableAtCaret(root, selectionService);
    if (!cell || !table || !cell.parentElement) return;
    const cellIndex = Array.from(cell.parentElement.children).indexOf(cell);
    const rows = table.querySelectorAll('tr');
    if (rows.length === 0 || rows[0].children.length <= 1) {
      table.remove();
    } else {
      rows.forEach((tr) => {
        if (cellIndex < tr.children.length) tr.children[cellIndex].remove();
      });
    }
    editorService.normalize();
  }
};
