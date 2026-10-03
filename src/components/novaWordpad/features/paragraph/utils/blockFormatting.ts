import { closestTag } from '../../../core/dom/traverse';

const BLOCK_TAGS = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'PRE', 'LI', 'DIV'];

/** Returns every top-level block element touched by the current selection. */
export function getSelectedBlocks(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return [];
  const range = selection.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return [];

  const startBlock = closestTag(range.startContainer, BLOCK_TAGS, root) as HTMLElement | null;
  const endBlock = closestTag(range.endContainer, BLOCK_TAGS, root) as HTMLElement | null;
  if (!startBlock) return [];
  if (startBlock === endBlock) return [startBlock];

  const blocks: HTMLElement[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (node) => (BLOCK_TAGS.includes((node as Element).tagName) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP)
  });

  let collecting = false;
  let node = walker.nextNode() as HTMLElement | null;
  while (node) {
    if (node === startBlock) collecting = true;
    if (collecting) blocks.push(node);
    if (node === endBlock) break;
    node = walker.nextNode() as HTMLElement | null;
  }
  return blocks.length ? blocks : [startBlock];
}

/**
 * Changes the tag of every selected block to `tagName` ("p", "h1"...,
 * "blockquote", "pre"). For "pre" the block's content is wrapped in a
 * <code> child per the canonical markup (spec #12).
 */
export function setBlockFormat(root: HTMLElement | null, tagName: string): void {
  const blocks = getSelectedBlocks(root);
  const upper = tagName.toUpperCase();

  blocks.forEach((block) => {
    if (block.tagName === 'LI') return; // list items keep their own semantics
    const replacement = document.createElement(upper);

    if (upper === 'PRE') {
      const code = document.createElement('code');
      code.innerHTML = block.innerHTML;
      replacement.appendChild(code);
    } else {
      replacement.innerHTML = block.innerHTML;
    }

    block.replaceWith(replacement);
  });
}

/** Sets text-align on every selected block. */
export function setAlignment(root: HTMLElement | null, align: string): void {
  const blocks = getSelectedBlocks(root);
  blocks.forEach((block) => {
    block.style.textAlign = align;
  });
}

/** Reads the current block's tag name (lowercased) for toolbar sync. */
export function getCurrentBlockTag(root: HTMLElement | null): string {
  const blocks = getSelectedBlocks(root);
  return blocks.length > 0 ? blocks[0].tagName.toLowerCase() : 'p';
}

export function getCurrentAlignment(root: HTMLElement | null): string {
  const blocks = getSelectedBlocks(root);
  return blocks[0]?.style.textAlign || 'left';
}
