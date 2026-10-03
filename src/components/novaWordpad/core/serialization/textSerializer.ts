const BLOCK_TAGS = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'BLOCKQUOTE', 'PRE', 'TR', 'TABLE']);

interface ListContext {
  ordered: boolean;
  index: number;
}

/**
 * Converts canonical HTML content into readable plain text.
 * Block elements become line breaks, list items get bullets/numbers,
 * table rows are tab-separated.
 */
export function htmlToText(root: HTMLElement): string {
  const lines: string[] = [];
  let current = '';

  const flush = (): void => {
    if (current.length) lines.push(current);
    current = '';
  };

  const walk = (node: Node, listContext: ListContext | null): void => {
    if (node.nodeType === 3) {
      current += node.textContent ?? '';
      return;
    }
    if (node.nodeType !== 1) return;

    const el = node as Element;
    const tag = el.tagName;

    if (tag === 'BR') {
      flush();
      return;
    }

    if (tag === 'LI') {
      flush();
      const prefix = listContext?.ordered === true ? `${listContext.index++}. ` : '• ';
      current = prefix;
      Array.from(el.childNodes).forEach((child) => walk(child, listContext));
      flush();
      return;
    }

    if (tag === 'UL' || tag === 'OL') {
      flush();
      const ctx: ListContext = tag === 'OL' ? { ordered: true, index: 1 } : { ordered: false, index: 0 };
      Array.from(el.childNodes).forEach((child) => walk(child, ctx));
      lines.push('');
      return;
    }

    if (tag === 'TR') {
      flush();
      const cells = Array.from(el.children).map((cell) => (cell.textContent ?? '').trim());
      lines.push(cells.join('\t'));
      return;
    }

    if (BLOCK_TAGS.has(tag)) {
      flush();
      Array.from(el.childNodes).forEach((child) => walk(child, listContext));
      flush();
      if (tag !== 'TR') lines.push('');
      return;
    }

    Array.from(el.childNodes).forEach((child) => walk(child, listContext));
  };

  Array.from(root.childNodes).forEach((child) => walk(child, null));
  flush();

  // Collapse runs of 3+ blank lines down to a single blank line.
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Normalizes whitespace for word/character counting. */
export function normalizeForCounting(root: HTMLElement): string {
  return htmlToText(root).replace(/\s+/g, ' ').trim();
}

export function countWords(root: HTMLElement): number {
  const text = normalizeForCounting(root);
  return text.length === 0 ? 0 : text.split(' ').filter(Boolean).length;
}

export function countCharacters(root: HTMLElement, includeSpaces = true): number {
  const text = htmlToText(root);
  return includeSpaces ? text.length : text.replace(/\s/g, '').length;
}
