import { toLines } from '../../../core/parser/tokenizer';
import { isBlank } from '../../../core/parser/parserUtils';
import type { MarkdownToken } from './markdown.types';

const ATX_HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const HR = /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/;
const UL_ITEM = /^(\s*)[-*+]\s+(.*)$/;
const OL_ITEM = /^(\s*)(\d+)[.)]\s+(.*)$/;
const BLOCKQUOTE = /^ {0,3}>\s?(.*)$/;
const FENCE = /^ {0,3}(`{3,}|~{3,})\s*(\S*)\s*$/;
const TABLE_ROW = /^\s*\|?(.+?)\|?\s*$/;
const TABLE_SEP = /^\s*\|?(\s*:?-{3,}:?\s*\|)*\s*:?-{3,}:?\s*\|?\s*$/;

/**
 * Tokenizes Markdown source into an array of block tokens:
 * { type, ...fields }. Inline content (the `text` field on
 * paragraph/heading/listItem/tableCell tokens) is left unparsed —
 * parser.ts runs inline parsing over it.
 */
export function lex(source: string): MarkdownToken[] {
  const lines = toLines(source);
  const tokens: MarkdownToken[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (isBlank(line)) {
      i += 1;
      continue;
    }

    const fenceMatch = line.match(FENCE);
    if (fenceMatch) {
      // Note: fenceMatch[1] (the opening fence run) is intentionally unused
      // beyond detection — any closing fence line ends the block, matching
      // the original implementation's behavior.
      const lang = fenceMatch[2] || '';
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !FENCE.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1; // consume closing fence
      tokens.push({ type: 'codeBlock', lang, code: body.join('\n') });
      continue;
    }

    if (HR.test(line) && !UL_ITEM.test(line)) {
      tokens.push({ type: 'hr' });
      i += 1;
      continue;
    }

    const headingMatch = line.match(ATX_HEADING);
    if (headingMatch) {
      tokens.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2] });
      i += 1;
      continue;
    }

    if (BLOCKQUOTE.test(line)) {
      const body: string[] = [];
      while (i < lines.length && (BLOCKQUOTE.test(lines[i]) || (!isBlank(lines[i]) && body.length > 0))) {
        const m = lines[i].match(BLOCKQUOTE);
        body.push(m ? m[1] : lines[i]);
        i += 1;
      }
      tokens.push({ type: 'blockquote', text: body.join(' ') });
      continue;
    }

    if (isTableStart(lines, i)) {
      const header = splitTableRow(lines[i]);
      i += 2; // header + separator
      const rows: string[][] = [];
      while (i < lines.length && TABLE_ROW.test(lines[i]) && !isBlank(lines[i])) {
        rows.push(splitTableRow(lines[i]));
        i += 1;
      }
      tokens.push({ type: 'table', header, rows });
      continue;
    }

    if (OL_ITEM.test(line) || UL_ITEM.test(line)) {
      const ordered = OL_ITEM.test(line);
      const items: string[] = [];
      while (i < lines.length && (OL_ITEM.test(lines[i]) || UL_ITEM.test(lines[i]))) {
        const m = ordered ? lines[i].match(OL_ITEM) : lines[i].match(UL_ITEM);
        items.push(ordered ? (m as RegExpMatchArray)[3] : (m as RegExpMatchArray)[2]);
        i += 1;
      }
      tokens.push({ type: 'list', ordered, items });
      continue;
    }

    // Paragraph: consume until blank line or a line starting a new block.
    const body: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      !isBlank(lines[i]) &&
      !ATX_HEADING.test(lines[i]) &&
      !HR.test(lines[i]) &&
      !FENCE.test(lines[i]) &&
      !BLOCKQUOTE.test(lines[i]) &&
      !UL_ITEM.test(lines[i]) &&
      !OL_ITEM.test(lines[i])
    ) {
      body.push(lines[i]);
      i += 1;
    }
    tokens.push({ type: 'paragraph', text: body.join('\n') });
  }

  return tokens;
}

function isTableStart(lines: string[], i: number): boolean {
  return lines[i + 1] !== undefined && TABLE_ROW.test(lines[i]) && TABLE_SEP.test(lines[i + 1]) && lines[i].includes('|');
}

function splitTableRow(line: string): string[] {
  const trimmed = line.trim().replace(/^\||\|$/g, '');
  return trimmed.split('|').map((cell) => cell.trim());
}
