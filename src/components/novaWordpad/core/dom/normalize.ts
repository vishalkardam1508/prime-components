import { walk } from './traverse';

/**
 * Converts legacy presentational markup (<font>, <b>, <i>, <strike>, <center>)
 * produced by document.execCommand into the editor's canonical tags.
 */
export function convertLegacyTags(root: HTMLElement): HTMLElement {
  const replacements: Array<{ from: string; to: string }> = [
    { from: 'B', to: 'STRONG' },
    { from: 'I', to: 'EM' },
    { from: 'STRIKE', to: 'S' },
    { from: 'DEL', to: 'S' }
  ];

  replacements.forEach(({ from, to }) => {
    root.querySelectorAll(from).forEach((el) => {
      const replacement = document.createElement(to);
      replacement.innerHTML = el.innerHTML;
      el.replaceWith(replacement);
    });
  });

  root.querySelectorAll('font').forEach((el) => {
    const span = document.createElement('span');
    const style: Record<string, string> = {};
    const face = el.getAttribute('face');
    const color = el.getAttribute('color');
    const size = el.getAttribute('size');
    if (face) style['font-family'] = face;
    if (color) style.color = color;
    if (size) style['font-size'] = mapLegacySize(size);
    span.setAttribute(
      'style',
      Object.entries(style)
        .map(([k, v]) => `${k}: ${v}`)
        .join('; ')
    );
    span.innerHTML = el.innerHTML;
    el.replaceWith(span);
  });

  root.querySelectorAll('center').forEach((el) => {
    const div = document.createElement('div');
    div.setAttribute('style', 'text-align: center');
    div.innerHTML = el.innerHTML;
    el.replaceWith(div);
  });

  return root;
}

function mapLegacySize(size: string): string {
  const map: Record<string, string> = { '1': '10px', '2': '13px', '3': '16px', '4': '18px', '5': '24px', '6': '32px', '7': '48px' };
  return map[size] ?? '16px';
}

/**
 * Only genuine inline-formatting-run tags are merge candidates. Merging is
 * meant to collapse adjacent, identically-styled inline wrappers a command
 * may have produced (e.g. `<strong>a</strong><strong>b</strong>` -> one
 * `<strong>ab</strong>`) — it must never apply to block/structural elements.
 * Two adjacent `<td>`/`<tr>`/`<li>` cells, or two adjacent `<p>` paragraphs,
 * are frequently "identical" (same tag, no style, no href) without being
 * "the same run": merging them silently eats table cells/rows, list items,
 * or whole paragraphs down to one. This is exactly what happened with
 * freshly-inserted tables (all-empty `<td>` cells collapsing to a single
 * cell) and with any two adjacent plain paragraphs collapsing into one on
 * every formatting command. An allow-list (rather than a growing exclude
 * list) is deliberate: anything not explicitly inline-safe defaults to
 * non-mergeable.
 */
const INLINE_MERGEABLE_TAGS = new Set(['SPAN', 'STRONG', 'EM', 'U', 'S', 'SUP', 'SUB', 'A']);

/** Merges adjacent sibling elements that share the same tag + style/attrs. */
export function mergeAdjacentSiblings(root: HTMLElement): HTMLElement {
  walk(root, (node) => {
    if (node.nodeType !== 1) return;
    const el = node as Element;
    if (!INLINE_MERGEABLE_TAGS.has(el.tagName)) return;
    let next = el.nextSibling;
    while (
      next &&
      next.nodeType === 1 &&
      INLINE_MERGEABLE_TAGS.has((next as Element).tagName) &&
      (next as Element).tagName === el.tagName &&
      (next as Element).getAttribute('style') === el.getAttribute('style') &&
      (next as Element).getAttribute('href') === el.getAttribute('href')
    ) {
      const nextEl = next as Element;
      while (nextEl.firstChild) el.appendChild(nextEl.firstChild);
      const toRemove = nextEl;
      next = nextEl.nextSibling;
      toRemove.remove();
    }
  });
  return root;
}

/** Removes elements that carry no content and no structural purpose. */
export function stripEmptyElements(root: HTMLElement, keepTags: string[] = ['BR', 'IMG', 'HR', 'TD', 'TH']): HTMLElement {
  let changed = true;
  while (changed) {
    changed = false;
    root.querySelectorAll('*').forEach((el) => {
      if (keepTags.includes(el.tagName)) return;
      if (el.childNodes.length === 0 && el.tagName !== 'SPAN') return;
      const isTrulyEmpty =
        (el.textContent ?? '').trim().length === 0 && !el.querySelector(keepTags.join(','));
      if (isTrulyEmpty && el.tagName === 'SPAN') {
        el.remove();
        changed = true;
      }
    });
  }
  return root;
}

/** Removes empty style/class attributes left behind after editing. */
export function stripDeadAttributes(root: HTMLElement): HTMLElement {
  root.querySelectorAll('[style]').forEach((el) => {
    if (!el.getAttribute('style')?.trim()) el.removeAttribute('style');
  });
  root.querySelectorAll('[class]').forEach((el) => {
    if (!el.getAttribute('class')?.trim()) el.removeAttribute('class');
  });
  return root;
}
