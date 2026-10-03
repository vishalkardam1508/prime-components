/**
 * Creates a DOM element with attributes, style, and children in one call.
 * Kept dependency-free so it can be used from any core/feature module.
 */

export type CreateElementChild = Node | string | null | undefined;

export type CreateElementAttrValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Partial<CSSStyleDeclaration>
  | ((event: Event) => void);

export type CreateElementAttrs = Record<string, CreateElementAttrValue>;

export function createElement(
  tag: string,
  attrs: CreateElementAttrs = {},
  children: CreateElementChild[] = []
): HTMLElement {
  const el = document.createElement(tag);

  Object.entries(attrs).forEach(([key, value]) => {
    if (value == null || value === false) return;
    if (typeof value === 'object') {
      if (key === 'style') Object.assign(el.style, value);
      return;
    }
    if (typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
      return;
    }
    if (key === 'className') {
      el.className = String(value);
      return;
    }
    el.setAttribute(key, String(value));
  });

  children.forEach((child) => {
    if (child == null) return;
    el.appendChild(typeof child === 'string' ? document.createTextNode(child) : child);
  });

  return el;
}

/** Creates a detached document fragment from an HTML string. */
export function fragmentFromHtml(html: string): DocumentFragment {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template.content;
}
