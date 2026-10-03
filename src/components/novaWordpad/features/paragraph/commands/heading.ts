import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';
import { setBlockFormat, getCurrentBlockTag } from '../utils/blockFormatting';

export type BlockFormatTag = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote' | 'pre';

export const headingCommand: Omit<CommandDefinition<EditorCommandContext, BlockFormatTag, void, BlockFormatTag>, 'id'> = {
  label: 'Paragraph Style',
  execute({ editorService }, tagName) {
    const root = editorService.getRoot();
    if (!root || !tagName) return;
    root.focus();
    setBlockFormat(root, tagName);
    editorService.normalize();
  },
  currentValue({ editorService }) {
    const root = editorService.getRoot();
    return root ? (getCurrentBlockTag(root) as BlockFormatTag) : 'p';
  }
};
