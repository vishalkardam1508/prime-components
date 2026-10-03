/** Walks every node in a subtree (depth-first, pre-order), calling `visit`. */
export function walk(root: Node | null | undefined, visit: (node: Node) => void): void {
  if (!root) return;
  visit(root);
  let child = root.firstChild;
  while (child) {
    walk(child, visit);
    child = child.nextSibling;
  }
}

/** Returns the closest ancestor (or self) matching `predicate`, bounded by `root`. */
export function closest(
  node: Node | null | undefined,
  predicate: (node: Node) => boolean,
  root: Node | null = null
): Node | null {
  let current: Node | null = node ?? null;
  while (current && current !== root?.parentNode) {
    if (predicate(current)) return current;
    if (current === root) break;
    current = current.parentNode;
  }
  return null;
}

/** Returns the closest ancestor element matching one of the given tag names. */
export function closestTag(
  node: Node | null | undefined,
  tagNames: string[],
  root: Node | null = null
): Element | null {
  const set = new Set(tagNames.map((t) => t.toUpperCase()));
  const found = closest(node, (n) => n.nodeType === 1 && set.has((n as Element).tagName), root);
  return found as Element | null;
}

/** Collects all descendant elements matching a predicate. */
export function collect(root: Node | null | undefined, predicate: (node: Element) => boolean): Element[] {
  const results: Element[] = [];
  walk(root, (node) => {
    if (node.nodeType === 1 && predicate(node as Element)) results.push(node as Element);
  });
  return results;
}

/** Returns true if `node` is empty of meaningful content (no text, no <img>/<br>). */
export function isEmptyNode(node: Node | null | undefined): boolean {
  if (!node) return true;
  if (node.nodeType === 3) return (node.textContent ?? '').trim().length === 0;
  if (node.nodeType !== 1) return true;
  if (['IMG', 'BR', 'HR'].includes((node as Element).tagName)) return false;
  return Array.from(node.childNodes).every((child) => isEmptyNode(child));
}

/** Flattens the child text nodes of an element into a plain string. */
export function textContentNormalized(node: Node): string {
  return (node.textContent ?? '').replace(/\s+/g, ' ').trim();
}
