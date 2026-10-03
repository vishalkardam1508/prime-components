import { sanitizeNode } from './sanitizeHtml';
import { convertLegacyTags, mergeAdjacentSiblings, stripDeadAttributes } from '../../../core/dom/normalize';
import { DEFAULT_DOCUMENT_HTML } from '../constants/editorConstants';

/**
 * Runs the full canonicalization pipeline on a live editor DOM subtree:
 * legacy tag conversion -> sanitize -> merge -> strip empties/dead attrs.
 * Safe to call after every meaningful mutation (paste, browser commands).
 */
export function normalizeEditorDom(root: HTMLElement): HTMLElement {
  convertLegacyTags(root);
  sanitizeNode(root);
  mergeAdjacentSiblings(root);
  stripDeadAttributes(root);
  ensureNotEmpty(root);
  return root;
}

/** Normalizes a raw HTML string (used by importers) into canonical HTML. */
export function normalizeHtmlString(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  normalizeEditorDom(doc.body);
  return doc.body.innerHTML || DEFAULT_DOCUMENT_HTML;
}

function ensureNotEmpty(root: HTMLElement): void {
  if (root.childNodes.length === 0) {
    root.innerHTML = DEFAULT_DOCUMENT_HTML;
  }
}
