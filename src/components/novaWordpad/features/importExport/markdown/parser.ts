import { unescapeMarkdown } from '../../../core/parser/parserUtils';
import type { BlockNode, InlineNode, MarkdownDocument, MarkdownToken } from './markdown.types';

/**
 * Converts lexer block tokens into a document AST. Inline spans (bold,
 * italic, code, links, images, strikethrough, hard breaks, escapes)
 * are parsed here into a recursive `children` array per spec #36.
 */
export function parse(tokens: MarkdownToken[]): MarkdownDocument {
  return {
    type: 'document',
    children: tokens.map(tokenToNode),
  };
}

function tokenToNode(token: MarkdownToken): BlockNode {
  switch (token.type) {
    case 'heading':
      return { type: 'heading', level: token.level, children: parseInline(token.text) };
    case 'paragraph':
      return { type: 'paragraph', children: parseInline(token.text) };
    case 'blockquote':
      return { type: 'blockquote', children: parseInline(token.text) };
    case 'codeBlock':
      return { type: 'codeBlock', lang: token.lang, code: token.code };
    case 'hr':
      return { type: 'hr' };
    case 'list':
      return {
        type: 'list',
        ordered: token.ordered,
        items: token.items.map((item) => ({ type: 'listItem', children: parseInline(item) })),
      };
    case 'table':
      return {
        type: 'table',
        header: token.header.map((cell) => parseInline(cell)),
        rows: token.rows.map((row) => row.map((cell) => parseInline(cell))),
      };
    default:
      return { type: 'paragraph', children: [{ type: 'text', value: '' }] };
  }
}

const INLINE_PATTERN =
  /(!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\))|(\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\))|(\*\*([\s\S]+?)\*\*)|(__([\s\S]+?)__)|(~~([\s\S]+?)~~)|(`([^`]+?)`)|(\*([\s\S]+?)\*)|(_([\s\S]+?)_)|( {2}\n|\\\n)|(\\[\\`*_{}[\]()#+\-.!>~|])/;

/** Parses a run of raw Markdown text into inline AST nodes. */
export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const match = remaining.match(INLINE_PATTERN);
    if (!match) {
      nodes.push({ type: 'text', value: unescapeMarkdown(remaining) });
      break;
    }

    const index = match.index ?? 0;
    if (index > 0) {
      nodes.push({ type: 'text', value: unescapeMarkdown(remaining.slice(0, index)) });
    }

    if (match[1]) {
      nodes.push({ type: 'image', alt: match[2] ?? '', src: match[3] ?? '' });
    } else if (match[4]) {
      nodes.push({ type: 'link', url: match[6] ?? '', children: parseInline(match[5] ?? '') });
    } else if (match[7]) {
      nodes.push({ type: 'strong', children: parseInline(match[8] ?? '') });
    } else if (match[9]) {
      nodes.push({ type: 'strong', children: parseInline(match[10] ?? '') });
    } else if (match[11]) {
      nodes.push({ type: 'strike', children: parseInline(match[12] ?? '') });
    } else if (match[13]) {
      nodes.push({ type: 'code', value: match[14] ?? '' });
    } else if (match[15]) {
      nodes.push({ type: 'em', children: parseInline(match[16] ?? '') });
    } else if (match[17]) {
      nodes.push({ type: 'em', children: parseInline(match[18] ?? '') });
    } else if (match[19]) {
      nodes.push({ type: 'break' });
    } else if (match[20]) {
      nodes.push({ type: 'text', value: match[20][1] });
    }

    remaining = remaining.slice(index + match[0].length);
  }

  return nodes;
}
