/** Groups consecutive lines matching `predicate` into arrays. */
export function groupConsecutive<T>(lines: T[], predicate: (line: T) => boolean): T[][] {
  const groups: T[][] = [];
  let current: T[] | null = null;

  lines.forEach((line) => {
    if (predicate(line)) {
      if (!current) {
        current = [];
        groups.push(current);
      }
      current.push(line);
    } else {
      current = null;
    }
  });

  return groups;
}

/** Escapes Markdown special characters inside plain text runs. */
export function escapeMarkdown(text: string): string {
  return text.replace(/([\\`*_{}[\]()#+\-.!>~|])/g, '\\$1');
}

/** Unescapes a backslash-escaped Markdown character run. */
export function unescapeMarkdown(text: string): string {
  return text.replace(/\\([\\`*_{}[\]()#+\-.!>~|])/g, '$1');
}

export function isBlank(line: string): boolean {
  return line.trim().length === 0;
}
