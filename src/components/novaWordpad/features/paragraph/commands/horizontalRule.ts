import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';

export const horizontalRuleCommand: Omit<CommandDefinition<EditorCommandContext, undefined, void>, 'id'> = {
  label: 'Horizontal Rule',
  execute({ editorService, selectionService }) {
    const root = editorService.getRoot();
    if (!root) return;
    root.focus();
    const hr = document.createElement('hr');
    selectionService.insertNodeAtCaret(hr);
    editorService.normalize();
  }
};
