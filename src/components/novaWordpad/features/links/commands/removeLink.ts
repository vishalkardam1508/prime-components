import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';
import { closestTag } from '../../../core/dom/traverse';

/** Unwraps the `<a>` enclosing the caret, keeping its child content in place. */
export const removeLinkCommand: Omit<CommandDefinition<EditorCommandContext, void, void>, 'id'> = {
  label: 'Remove Link',
  execute({ editorService, selectionService }): void {
    const root = editorService.getRoot();
    if (!root) return;
    const range = selectionService.getRange();
    const anchor = range ? closestTag(range.startContainer, ['A'], root) : null;
    if (!anchor) return;
    const parent = anchor.parentNode;
    if (!parent) return;
    while (anchor.firstChild) parent.insertBefore(anchor.firstChild, anchor);
    parent.removeChild(anchor);
    editorService.normalize();
  }
};
