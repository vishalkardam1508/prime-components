import { closestTag } from '../../../core/dom/traverse';
import type { EditorCommandContext } from '../../editor/types/editor.types';

/** Block-level tags this editor styles bold/heavy by default CSS, with no explicit <b>/<strong> tag involved. */
const INHERITED_BOLD_BLOCK_TAGS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'TH'];

/**
 * `document.queryCommandState('bold'/'italic'/...)` reports whether the
 * *computed* style at the caret is bold/italic/etc, which conflates two very
 * different situations for a collapsed caret with no active selection:
 *
 * 1. A genuine pending toggle — the user just clicked Bold with the caret
 *    sitting in plain text; nothing is typed yet, so no `<b>`/`<strong>` tag
 *    exists, but the browser is correctly tracking "the next character
 *    typed here will be bold". This SHOULD show as active.
 * 2. A false positive from inherited block-level CSS — a caret inside an
 *    `<h1>` (headings render bold by default) reports `true` even though no
 *    toggle ever happened and nothing will make new text bold beyond the
 *    heading's own styling. This should NOT show as active.
 *
 * Both report identically via `queryCommandState`, and neither the DOM nor
 * the selection API exposes the "is this a pending typing-style override"
 * flag directly — so this only overrides to `false` for the ONE known
 * source of the false-positive case in this editor (headings, and `<th>`
 * table headers), trusting the native state everywhere else. Getting this
 * wrong the other way (requiring an explicit tag for every collapsed caret)
 * makes the toolbar never show "about to type bold" as active until
 * something is actually typed — its own confusing regression.
 */
export function isInlineTagActive(context: EditorCommandContext, execCommand: string, tagNames: string[]): boolean {
  if (!document.queryCommandState(execCommand)) return false;
  const range = context.selectionService.getRange();
  if (!range) return false;
  if (!range.collapsed) return true;

  const root = context.editorService.getRoot();
  if (closestTag(range.startContainer, tagNames, root) !== null) return true;

  const inheritedBoldBlock = closestTag(range.startContainer, INHERITED_BOLD_BLOCK_TAGS, root);
  return inheritedBoldBlock === null;
}

/**
 * Wraps the current selection within `root` in a <span style="prop:value">.
 * Falls back to inserting an empty span at the caret when there is no
 * selection, so subsequent typing picks up the style.
 */
export function applyInlineStyle(root: HTMLElement, styleProp: string, value: string): void {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return;

  if (range.collapsed) {
    const span = document.createElement('span');
    span.style.setProperty(styleProp, value);
    const zeroWidthText = document.createTextNode('​');
    span.appendChild(zeroWidthText);
    range.insertNode(span);
    const newRange = document.createRange();
    newRange.setStart(zeroWidthText, 1);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);
    return;
  }

  const contents = range.extractContents();
  const span = document.createElement('span');
  span.style.setProperty(styleProp, value);
  span.appendChild(contents);
  range.insertNode(span);

  const newRange = document.createRange();
  newRange.selectNodeContents(span);
  selection.removeAllRanges();
  selection.addRange(newRange);
}

/** Reads the effective inline style value at the caret/selection start. */
export function getInlineStyleAtCaret(root: HTMLElement, styleProp: string): string | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;

  let node: Node | null = range.startContainer;
  if (node.nodeType === 3) node = node.parentElement;
  const computed = node !== null && node.nodeType === 1 ? window.getComputedStyle(node as Element) : null;
  return computed ? computed.getPropertyValue(styleProp) : null;
}
