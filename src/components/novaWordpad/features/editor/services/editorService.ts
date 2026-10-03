import { normalizeEditorDom } from '../utils/normalizeHtml';
import { serializeToHtml } from '../../../core/serialization/htmlSerializer';
import { DEFAULT_DOCUMENT_HTML } from '../constants/editorConstants';
import type { EditorService } from '../types/editor.types';

/**
 * Creates an editor API bound to a specific contenteditable root element.
 * This is the single place that touches editor DOM content directly.
 */
export function createEditorService(getRoot: () => HTMLElement | null): EditorService {
  return {
    getRoot,

    focus(): void {
      getRoot()?.focus();
    },

    getHtml(): string {
      const root = getRoot();
      if (!root) return DEFAULT_DOCUMENT_HTML;
      return serializeToHtml(root);
    },

    setHtml(html: string): void {
      const root = getRoot();
      if (!root) return;
      root.innerHTML = html || DEFAULT_DOCUMENT_HTML;
      normalizeEditorDom(root);
    },

    normalize(): void {
      const root = getRoot();
      if (root) normalizeEditorDom(root);
    },

    isEmpty(): boolean {
      const root = getRoot();
      if (!root) return true;
      return (root.textContent ?? '').trim().length === 0 && !root.querySelector('img, table, hr');
    },

    execLegacy(command: string, value: string | null = null): void {
      const root = getRoot();
      if (!root) return;
      root.focus();
      // Deliberately NOT setting styleWithCSS=true: every command routed through
      // execLegacy (bold/italic/underline/strike/sub/superscript, clearFormatting,
      // list commands) is tag-based (<strong>/<em>/<u>/<s>/<sup>/<sub>/<ul>/<li>),
      // all of which are in the sanitizer's ALLOWED_TAGS. styleWithCSS=true instead
      // makes the browser apply these via inline styles (e.g. font-weight/
      // font-style/text-decoration), none of which are in ALLOWED_STYLE_PROPS —
      // normalizeEditorDom's sanitize pass immediately strips them, silently
      // undoing the formatting that was just applied.
      document.execCommand(command, false, value ?? undefined);
      normalizeEditorDom(root);
    }
  };
}
