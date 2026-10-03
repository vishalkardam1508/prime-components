import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';

export const bulletListCommand: Omit<CommandDefinition<EditorCommandContext, undefined, void>, 'id'> = {
  label: 'Bulleted List',
  shortcut: 'Ctrl+Shift+8',
  execute({ editorService }) {
    editorService.execLegacy('insertUnorderedList');
  },
  isActive() {
    return document.queryCommandState('insertUnorderedList');
  }
};
