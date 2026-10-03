import { closestTag } from '../dom/traverse';

const BLOCK_TAGS = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'PRE', 'DIV'];

/** Returns the active Range inside `root`, or null if selection is elsewhere. */
export function getRangeWithin(root: HTMLElement | null): Range | null {
  if (!root) return null;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;
  return range;
}

/** Selects all content within `root`. */
export function selectAll(root: HTMLElement | null): void {
  if (!root) return;
  const range = document.createRange();
  range.selectNodeContents(root);
  const selection = window.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
}

/** Collapses the caret to the end of `root`. */
export function collapseToEnd(root: HTMLElement | null): void {
  if (!root) return;
  const range = document.createRange();
  range.selectNodeContents(root);
  range.collapse(false);
  const selection = window.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
}

/** Returns the block-level ancestor element containing the caret. */
export function getBlockAncestor(root: HTMLElement | null): Element | null {
  const range = getRangeWithin(root);
  if (!range) return null;
  return closestTag(range.startContainer, BLOCK_TAGS, root);
}

/** Returns true if the current selection within `root` is non-empty. */
export function hasSelection(root: HTMLElement | null): boolean {
  const range = getRangeWithin(root);
  return range != null && !range.collapsed;
}

/** Inserts a node at the current caret position, replacing any selection. */
export function insertNodeAtCaret(root: HTMLElement | null, node: Node): void {
  if (!root) return;
  const range = getRangeWithin(root);
  if (!range) {
    root.appendChild(node);
    return;
  }
  range.deleteContents();
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  const selection = window.getSelection();
  if (!selection) return;
  selection.removeAllRanges();
  selection.addRange(range);
}
