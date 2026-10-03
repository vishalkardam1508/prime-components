import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';
import { isInlineTagActive } from '../utils/formattingUtils';

export const superscriptCommand: Omit<CommandDefinition<EditorCommandContext, undefined, void>, 'id'> = {
  label: 'Superscript',
  execute({ editorService }): void {
    editorService.execLegacy('superscript');
  },
  isActive(context): boolean {
    return isInlineTagActive(context, 'superscript', ['SUP']);
  }
};
