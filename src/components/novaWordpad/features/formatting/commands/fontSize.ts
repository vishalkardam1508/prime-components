import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';
import { applyInlineStyle, getInlineStyleAtCaret } from '../utils/formattingUtils';

/** `currentValue` reads back the caret's computed CSS font-size (e.g. "16px"), not the applied point payload. */
export const fontSizeCommand: Omit<CommandDefinition<EditorCommandContext, number, void, string>, 'id'> = {
  label: 'Font Size',
  execute({ editorService }, sizeInPoints): void {
    const root = editorService.getRoot();
    if (root === null || typeof sizeInPoints !== 'number' || Number.isNaN(sizeInPoints)) return;
    root.focus();
    applyInlineStyle(root, 'font-size', `${sizeInPoints}pt`);
    editorService.normalize();
  },
  currentValue({ editorService }): string | null {
    const root = editorService.getRoot();
    return root === null ? null : getInlineStyleAtCaret(root, 'font-size');
  }
};
