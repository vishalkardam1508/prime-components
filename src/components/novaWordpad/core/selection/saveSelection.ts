/** A selection captured as plain character offsets relative to a root element. */
export interface SelectionSnapshot {
  start: number;
  end: number;
  collapsed: boolean;
}

/**
 * Captures the current selection relative to `root` as plain character
 * offsets, so it survives DOM mutations (dialogs opening, re-renders)
 * that would invalidate a raw Range reference.
 */
export function saveSelection(root: HTMLElement | null): SelectionSnapshot | null {
  if (!root) return null;

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;

  const preRange = range.cloneRange();
  preRange.selectNodeContents(root);
  preRange.setEnd(range.startContainer, range.startOffset);
  const start = preRange.toString().length;

  return {
    start,
    end: start + range.toString().length,
    collapsed: range.collapsed
  };
}
