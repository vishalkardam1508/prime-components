import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';
import { getCellAtCaret } from '../utils/tableUtils';

export type CellAlignValue = 'left' | 'center' | 'right' | 'justify';

export const cellAlignCommand: Omit<CommandDefinition<EditorCommandContext, CellAlignValue, void>, 'id'> = {
  label: 'Cell Alignment',
  execute({ editorService, selectionService }, align) {
    const root = editorService.getRoot();
    const cell = getCellAtCaret(root, selectionService);
    if (!cell || !align) return;
    cell.style.textAlign = align;
    editorService.normalize();
  }
};

export const cellBackgroundCommand: Omit<CommandDefinition<EditorCommandContext, string, void>, 'id'> = {
  label: 'Cell Background',
  execute({ editorService, selectionService }, color) {
    const root = editorService.getRoot();
    const cell = getCellAtCaret(root, selectionService);
    if (!cell || !color) return;
    cell.style.backgroundColor = color;
    editorService.normalize();
  }
};
