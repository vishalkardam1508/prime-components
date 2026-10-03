import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';

export const numberedListCommand: Omit<CommandDefinition<EditorCommandContext, undefined, void>, 'id'> = {
  label: 'Numbered List',
  shortcut: 'Ctrl+Shift+7',
  execute({ editorService }) {
    editorService.execLegacy('insertOrderedList');
  },
  isActive() {
    return document.queryCommandState('insertOrderedList');
  }
};
