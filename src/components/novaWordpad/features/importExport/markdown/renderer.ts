import { escapeHtml } from '../../../core/serialization/htmlSerializer';
import type { BlockNode, InlineNode, MarkdownDocument } from './markdown.types';

export function render(ast: MarkdownDocument): string {
  return ast.children.map(renderBlock).join('');
}

function renderBlock(node: BlockNode): string {
  switch (node.type) {
    case 'heading':
      return `<h${node.level}>${renderInline(node.children)}</h${node.level}>`;
    case 'paragraph':
      return `<p>${renderInline(node.children)}</p>`;
    case 'blockquote':
      return `<blockquote>${renderInline(node.children)}</blockquote>`;
    case 'codeBlock':
      return `<pre><code>${escapeHtml(node.code)}</code></pre>`;
    case 'hr':
      return '<hr>';
    case 'list': {
      const tag = node.ordered ? 'ol' : 'ul';
      const items = node.items.map((item) => `<li>${renderInline(item.children)}</li>`).join('');
      return `<${tag}>${items}</${tag}>`;
    }
    case 'table': {
      const head = `<tr>${node.header.map((cell) => `<th>${renderInline(cell)}</th>`).join('')}</tr>`;
      const body = node.rows
        .map((row) => `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`)
        .join('');
      return `<table><thead>${head}</thead><tbody>${body}</tbody></table>`;
    }
    default:
      return '';
  }
}

function renderInline(nodes: InlineNode[]): string {
  return nodes.map(renderInlineNode).join('');
}

function renderInlineNode(node: InlineNode): string {
  switch (node.type) {
    case 'text':
      return escapeHtml(node.value);
    case 'strong':
      return `<strong>${renderInline(node.children)}</strong>`;
    case 'em':
      return `<em>${renderInline(node.children)}</em>`;
    case 'strike':
      return `<s>${renderInline(node.children)}</s>`;
    case 'code':
      return `<code>${escapeHtml(node.value)}</code>`;
    case 'link':
      return `<a href="${escapeHtml(node.url)}">${renderInline(node.children)}</a>`;
    case 'image':
      return `<img src="${escapeHtml(node.src)}" alt="${escapeHtml(node.alt || '')}">`;
    case 'break':
      return '<br>';
    default:
      return '';
  }
}
