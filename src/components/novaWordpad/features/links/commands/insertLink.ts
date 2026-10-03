import type { CommandDefinition } from '../../../core/commands/commandRegistry';
import type { EditorCommandContext, SelectionService } from '../../editor/types/editor.types';
import { closestTag } from '../../../core/dom/traverse';
import { isSafeUrl, normalizeUrl } from '../utils/validateUrl';

/** Payload accepted by `insertLinkCommand`. */
export interface InsertLinkPayload {
  url: string;
  text?: string;
  newWindow?: boolean;
}

/** A link (if any) enclosing the current caret, for editing. */
export interface LinkAtCaret {
  url: string;
  text: string;
  node: Element;
}

/**
 * Inserts a link at the caret/selection, or updates the enclosing <a>
 * if the caret is already inside one.
 */
export const insertLinkCommand: Omit<CommandDefinition<EditorCommandContext, InsertLinkPayload, void>, 'id'> = {
  label: 'Insert Link',
  shortcut: 'Ctrl+K',
  execute({ editorService, selectionService }, { url, text, newWindow = true }): void {
    const root = editorService.getRoot();
    if (!root) return;
    const safeUrl = normalizeUrl(url);
    if (!isSafeUrl(safeUrl)) return;

    root.focus();
    const range = selectionService.getRange();
    const existingLink = range ? closestTag(range.startContainer, ['A'], root) : null;

    if (existingLink) {
      existingLink.setAttribute('href', safeUrl);
      if (text) existingLink.textContent = text;
    } else {
      const anchor = document.createElement('a');
      anchor.setAttribute('href', safeUrl);
      anchor.textContent = text || safeUrl;
      if (newWindow) {
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener noreferrer');
      }
      selectionService.insertNodeAtCaret(anchor);
    }
    editorService.normalize();
  }
};

/** Reads the link (if any) enclosing the current caret, for editing. */
export function getLinkAtCaret(root: HTMLElement | null, selectionService: SelectionService): LinkAtCaret | null {
  const range = selectionService.getRange();
  if (!range) return null;
  const anchor = closestTag(range.startContainer, ['A'], root);
  if (!anchor) return null;
  return { url: anchor.getAttribute('href') ?? '', text: anchor.textContent ?? '', node: anchor };
}
