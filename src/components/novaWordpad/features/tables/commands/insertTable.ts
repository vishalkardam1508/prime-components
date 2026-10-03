import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';
import { buildTable } from '../utils/tableUtils';

export interface InsertTablePayload {
  rows?: number;
  cols?: number;
}

export const insertTableCommand: Omit<CommandDefinition<EditorCommandContext, InsertTablePayload | undefined, void>, 'id'> = {
  label: 'Insert Table',
  execute({ editorService, selectionService }, payload) {
    const root = editorService.getRoot();
    if (!root) return;
    root.focus();
    const { rows = 2, cols = 2 } = payload ?? {};
    const table = buildTable(rows, cols);
    selectionService.insertNodeAtCaret(table);
    editorService.normalize();
  }
};

export const deleteTableCommand: Omit<CommandDefinition<EditorCommandContext, undefined, void>, 'id'> = {
  label: 'Delete Table',
  execute({ editorService, selectionService }) {
    const root = editorService.getRoot();
    if (!root) return;
    const range = selectionService.getRange();
    const table = range ? (range.startContainer.parentElement?.closest('table') ?? null) : null;
    const target = table ?? root.querySelector('table.is-selected');
    if (target) {
      target.remove();
      editorService.normalize();
    }
  }
};
