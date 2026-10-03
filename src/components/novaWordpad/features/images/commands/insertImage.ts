import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext } from '../../editor/types/editor.types';

/** Payload accepted by `insertImageCommand`. */
export interface InsertImagePayload {
  src: string;
  alt?: string;
}

/** Inserts an `<img>` at the caret, sourced from a URL or a data URL. */
export const insertImageCommand: Omit<CommandDefinition<EditorCommandContext, InsertImagePayload, void>, 'id'> = {
  label: 'Insert Image',
  execute({ editorService, selectionService }, { src, alt = 'Image' }): void {
    const root = editorService.getRoot();
    if (!root || !src) return;
    root.focus();
    const img = document.createElement('img');
    img.setAttribute('src', src);
    img.setAttribute('alt', alt);
    img.style.maxWidth = '100%';
    selectionService.insertNodeAtCaret(img);
    editorService.normalize();
  }
};
