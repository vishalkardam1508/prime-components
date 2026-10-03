import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';

export const outdentCommand: Omit<CommandDefinition<EditorCommandContext, undefined, void>, 'id'> = {
  label: 'Outdent',
  execute({ editorService }) {
    editorService.execLegacy('outdent');
  }
};
