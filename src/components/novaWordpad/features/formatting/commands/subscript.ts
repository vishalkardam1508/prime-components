import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';
import { isInlineTagActive } from '../utils/formattingUtils';

export const subscriptCommand: Omit<CommandDefinition<EditorCommandContext, undefined, void>, 'id'> = {
  label: 'Subscript',
  execute({ editorService }): void {
    editorService.execLegacy('subscript');
  },
  isActive(context): boolean {
    return isInlineTagActive(context, 'subscript', ['SUB']);
  }
};
