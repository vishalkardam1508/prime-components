import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';
import { isInlineTagActive } from '../utils/formattingUtils';

export const underlineCommand: Omit<CommandDefinition<EditorCommandContext, undefined, void>, 'id'> = {
  label: 'Underline',
  shortcut: 'Ctrl+U',
  execute({ editorService }): void {
    editorService.execLegacy('underline');
  },
  isActive(context): boolean {
    return isInlineTagActive(context, 'underline', ['U']);
  }
};
