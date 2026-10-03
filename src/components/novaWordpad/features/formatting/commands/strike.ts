import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';
import { isInlineTagActive } from '../utils/formattingUtils';

export const strikeCommand: Omit<CommandDefinition<EditorCommandContext, undefined, void>, 'id'> = {
  label: 'Strikethrough',
  execute({ editorService }): void {
    editorService.execLegacy('strikeThrough');
  },
  isActive(context): boolean {
    return isInlineTagActive(context, 'strikeThrough', ['S', 'STRIKE', 'DEL']);
  }
};
