import type { SelectionSnapshot } from './saveSelection';

/**
 * Restores a selection previously captured with saveSelection().
 * Walks text nodes under `root` counting characters until it reaches
 * the recorded start/end offsets.
 */
export function restoreSelection(root: HTMLElement | null, snapshot: SelectionSnapshot | null): boolean {
  if (!root || !snapshot) return false;

  const range = document.createRange();
  range.selectNodeContents(root);

  let charIndex = 0;
  let startNode: Node | null = null;
  let startOffset = 0;
  let endNode: Node | null = null;
  let endOffset = 0;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let node = walker.nextNode();

  while (node) {
    const length = node.textContent?.length ?? 0;
    const nextIndex = charIndex + length;

    if (!startNode && snapshot.start >= charIndex && snapshot.start <= nextIndex) {
      startNode = node;
      startOffset = snapshot.start - charIndex;
    }
    if (!endNode && snapshot.end >= charIndex && snapshot.end <= nextIndex) {
      endNode = node;
      endOffset = snapshot.end - charIndex;
    }

    charIndex = nextIndex;
    node = walker.nextNode();
  }

  if (!startNode) {
    startNode = root;
    startOffset = root.childNodes.length;
  }
  if (!endNode) {
    endNode = startNode;
    endOffset = startOffset;
  }

  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);

  const selection = window.getSelection();
  if (!selection) return false;
  selection.removeAllRanges();
  selection.addRange(range);
  return true;
}
