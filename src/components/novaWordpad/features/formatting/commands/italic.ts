import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';
import { isInlineTagActive } from '../utils/formattingUtils';

export const italicCommand: Omit<CommandDefinition<EditorCommandContext, undefined, void>, 'id'> = {
  label: 'Italic',
  shortcut: 'Ctrl+I',
  execute({ editorService }): void {
    editorService.execLegacy('italic');
  },
  isActive(context): boolean {
    return isInlineTagActive(context, 'italic', ['I', 'EM']);
  }
};
