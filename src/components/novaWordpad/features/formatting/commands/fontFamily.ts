import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';
import { applyInlineStyle, getInlineStyleAtCaret } from '../utils/formattingUtils';

export const fontFamilyCommand: Omit<CommandDefinition<EditorCommandContext, string, void>, 'id'> = {
  label: 'Font Family',
  execute({ editorService }, fontFamily): void {
    const root = editorService.getRoot();
    if (root === null || typeof fontFamily !== 'string' || fontFamily.length === 0) return;
    root.focus();
    applyInlineStyle(root, 'font-family', fontFamily);
    editorService.normalize();
  },
  currentValue({ editorService }): string | null {
    const root = editorService.getRoot();
    return root === null ? null : getInlineStyleAtCaret(root, 'font-family');
  }
};
