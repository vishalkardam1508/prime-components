import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';
import { isInlineTagActive } from '../utils/formattingUtils';

export const boldCommand: Omit<CommandDefinition<EditorCommandContext, undefined, void>, 'id'> = {
  label: 'Bold',
  shortcut: 'Ctrl+B',
  execute({ editorService }): void {
    editorService.execLegacy('bold');
  },
  isActive(context): boolean {
    return isInlineTagActive(context, 'bold', ['B', 'STRONG']);
  }
};
