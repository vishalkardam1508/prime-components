import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';
import { setAlignment, getCurrentAlignment } from '../utils/blockFormatting';

export type AlignValue = 'left' | 'center' | 'right' | 'justify';

export const alignCommand: Omit<CommandDefinition<EditorCommandContext, AlignValue, void, AlignValue>, 'id'> = {
  label: 'Align',
  execute({ editorService }, direction) {
    const root = editorService.getRoot();
    if (!root || !direction) return;
    root.focus();
    setAlignment(root, direction);
    editorService.normalize();
  },
  currentValue({ editorService }) {
    const root = editorService.getRoot();
    return root ? (getCurrentAlignment(root) as AlignValue) : 'left';
  }
};
