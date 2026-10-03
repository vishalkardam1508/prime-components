import { ALLOWED_TAGS, ALLOWED_STYLE_PROPS, DANGEROUS_URL_PROTOCOLS } from '../constants/editorConstants';

const DANGEROUS_TAGS = ['script', 'iframe', 'object', 'embed', 'applet', 'style', 'link', 'meta', 'form'];

const ALLOWED_ATTRS = ['style', 'href', 'src', 'alt', 'title', 'target', 'rel', 'colspan', 'rowspan', 'width', 'height'];

/**
 * Sanitizes untrusted HTML (imports, clipboard, DOCX conversion) down to
 * the editor's canonical element/attribute/style allow-list. Never trust
 * imported markup before this has run.
 */
export function sanitizeHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  sanitizeNode(doc.body);
  return doc.body.innerHTML;
}

/** Sanitizes an already-parsed DOM subtree in place (used for clipboard paste). */
export function sanitizeNode(root: HTMLElement): HTMLElement {
  DANGEROUS_TAGS.forEach((tag) => {
    root.querySelectorAll(tag).forEach((el) => el.remove());
  });

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
  const toUnwrap: Element[] = [];

  let node = walker.nextNode() as Element | null;
  while (node) {
    const tag = node.tagName.toLowerCase();

    // Strip all event handler attributes and unsafe URL attributes.
    Array.from(node.attributes).forEach((attr) => {
      if (/^on/i.test(attr.name)) {
        node?.removeAttribute(attr.name);
        return;
      }
      if ((attr.name === 'href' || attr.name === 'src') && isDangerousUrl(attr.value)) {
        node?.removeAttribute(attr.name);
      }
    });

    const styleValue = node.getAttribute('style');
    if (styleValue != null) {
      node.setAttribute('style', filterStyle(styleValue));
    }

    // Whitelist only known attributes per tag; drop everything else risky.
    Array.from(node.attributes).forEach((attr) => {
      if (!ALLOWED_ATTRS.includes(attr.name)) node?.removeAttribute(attr.name);
    });

    if (!(ALLOWED_TAGS as readonly string[]).includes(tag)) {
      toUnwrap.push(node);
    }

    node = walker.nextNode() as Element | null;
  }

  toUnwrap.forEach((el) => {
    const parent = el.parentNode;
    if (!parent) return;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
  });

  // Force safe link semantics.
  root.querySelectorAll("a[target='_blank']").forEach((a) => {
    a.setAttribute('rel', 'noopener noreferrer');
  });

  return root;
}

function isDangerousUrl(value: string | null): boolean {
  const normalized = (value ?? '').trim().toLowerCase();
  return DANGEROUS_URL_PROTOCOLS.some((proto) => normalized.startsWith(proto));
}

function filterStyle(styleText: string): string {
  return styleText
    .split(';')
    .map((decl) => decl.trim())
    .filter(Boolean)
    .filter((decl) => {
      const [prop] = decl.split(':').map((s) => s.trim().toLowerCase());
      return (ALLOWED_STYLE_PROPS as readonly string[]).includes(prop);
    })
    .join('; ');
}
