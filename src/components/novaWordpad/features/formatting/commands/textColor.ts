import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';
import { applyInlineStyle } from '../utils/formattingUtils';

export const textColorCommand: Omit<CommandDefinition<EditorCommandContext, string, void>, 'id'> = {
  label: 'Text Color',
  execute({ editorService }, color): void {
    const root = editorService.getRoot();
    if (root === null || typeof color !== 'string' || color.length === 0) return;
    root.focus();
    applyInlineStyle(root, 'color', color);
    editorService.normalize();
  }
};
