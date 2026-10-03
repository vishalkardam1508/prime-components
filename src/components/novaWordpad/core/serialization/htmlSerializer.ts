const SELF_CLOSING = new Set(['br', 'hr', 'img']);

/**
 * Serializes a DOM node to an HTML string, stripping editor-only
 * artifacts (contenteditable attributes, data-editor-* hooks, empty
 * trailing <br> wrappers) so the output is clean canonical markup.
 */
export function serializeToHtml(root: HTMLElement): string {
  const clone = root.cloneNode(true) as HTMLElement;
  stripEditorArtifacts(clone);
  return Array.from(clone.childNodes).map(serializeNode).join('');
}

function stripEditorArtifacts(root: HTMLElement): void {
  root.removeAttribute('contenteditable');
  root.removeAttribute('spellcheck');
  root.querySelectorAll('[data-editor-ui]').forEach((el) => el.remove());
  root.querySelectorAll('*').forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      if (attr.name.startsWith('data-editor')) el.removeAttribute(attr.name);
    });
  });
}

function serializeNode(node: Node): string {
  if (node.nodeType === 3) return escapeHtml(node.textContent ?? '');
  if (node.nodeType === 8) return ''; // strip comments
  if (node.nodeType !== 1) return '';

  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  const attrs = serializeAttributes(el);

  if (SELF_CLOSING.has(tag)) {
    return `<${tag}${attrs}>`;
  }

  const inner = Array.from(el.childNodes).map(serializeNode).join('');
  return `<${tag}${attrs}>${inner}</${tag}>`;
}

function serializeAttributes(node: Element): string {
  return Array.from(node.attributes)
    .map((attr) => ` ${attr.name}="${escapeAttr(attr.value)}"`)
    .join('');
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/"/g, '&quot;');
}
