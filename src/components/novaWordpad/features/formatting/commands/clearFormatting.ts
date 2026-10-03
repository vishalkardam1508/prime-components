import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';

export const clearFormattingCommand: Omit<CommandDefinition<EditorCommandContext, undefined, void>, 'id'> = {
  label: 'Clear Formatting',
  execute({ editorService }): void {
    // removeFormat leaves block tags (h1, blockquote) alone by design;
    // it only strips inline formatting, matching WordPad's behavior.
    editorService.execLegacy('removeFormat');
  }
};
