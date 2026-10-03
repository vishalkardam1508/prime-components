import { escapeMarkdown } from '../../../core/parser/parserUtils';
import type { Exporter } from '../common/types';

const HEADING_LEVEL: Record<string, number> = { H1: 1, H2: 2, H3: 3, H4: 4, H5: 5, H6: 6 };

export const markdownExporter: Exporter = {
  export(canonicalHtml: string): Promise<Blob> {
    const doc = new DOMParser().parseFromString(canonicalHtml, 'text/html');
    const markdown = Array.from(doc.body.childNodes)
      .map((node) => blockToMarkdown(node))
      .filter(Boolean)
      .join('\n\n')
      .trim();
    return Promise.resolve(new Blob([`${markdown}\n`], { type: 'text/markdown' }));
  },
};

function blockToMarkdown(node: ChildNode): string {
  if (node.nodeType === 3) {
    const text = (node.textContent ?? '').trim();
    return text ? inlineToMarkdown(node) : '';
  }
  if (node.nodeType !== 1) return '';

  const el = node as Element;
  const tag = el.tagName;

  if (HEADING_LEVEL[tag]) {
    return `${'#'.repeat(HEADING_LEVEL[tag])} ${inlineToMarkdown(el).trim()}`;
  }
  if (tag === 'P' || tag === 'DIV') {
    return inlineToMarkdown(el).trim();
  }
  if (tag === 'BLOCKQUOTE') {
    return inlineToMarkdown(el)
      .trim()
      .split('\n')
      .map((line) => `> ${line}`)
      .join('\n');
  }
  if (tag === 'PRE') {
    const code = el.querySelector('code') || el;
    return '```\n' + (code.textContent ?? '').replace(/\n$/, '') + '\n```';
  }
  if (tag === 'HR') {
    return '---';
  }
  if (tag === 'UL' || tag === 'OL') {
    return Array.from(el.children)
      .filter((li) => li.tagName === 'LI')
      .map((li, i) => {
        const prefix = tag === 'OL' ? `${i + 1}. ` : '- ';
        return prefix + inlineToMarkdown(li).trim();
      })
      .join('\n');
  }
  if (tag === 'TABLE') {
    return tableToMarkdown(el);
  }

  return inlineToMarkdown(el).trim();
}

function tableToMarkdown(table: Element): string {
  const rows = Array.from(table.querySelectorAll('tr')).map((tr) =>
    Array.from(tr.children).map((cell) => inlineToMarkdown(cell).trim() || ' ')
  );
  if (rows.length === 0) return '';

  const [header, ...body] = rows;
  const separator = header.map(() => '---');
  const lines = [header, separator, ...body].map((row) => `| ${row.join(' | ')} |`);
  return lines.join('\n');
}

function inlineToMarkdown(node: Node): string {
  if (node.nodeType === 3) {
    return escapeMarkdown(node.textContent ?? '');
  }
  if (node.nodeType !== 1) return '';

  const el = node as Element;
  const tag = el.tagName;
  const inner = (): string => Array.from(el.childNodes).map(inlineToMarkdown).join('');

  switch (tag) {
    case 'STRONG':
    case 'B':
      return `**${inner()}**`;
    case 'EM':
    case 'I':
      return `*${inner()}*`;
    case 'S':
    case 'STRIKE':
      return `~~${inner()}~~`;
    case 'CODE':
      return `\`${el.textContent ?? ''}\``;
    case 'A':
      return `[${inner()}](${el.getAttribute('href') || ''})`;
    case 'IMG':
      return `![${el.getAttribute('alt') || ''}](${el.getAttribute('src') || ''})`;
    case 'BR':
      return '  \n';
    default:
      return inner();
  }
}
