/**
 * Block-level tokens produced by the lexer. Inline content (the `text`
 * field on paragraph/heading/blockquote/list-item/table-cell tokens) is
 * left as raw, unparsed Markdown — `parser.ts` runs inline parsing over it.
 */
export type MarkdownToken =
  | { type: 'codeBlock'; lang: string; code: string }
  | { type: 'hr' }
  | { type: 'heading'; level: number; text: string }
  | { type: 'blockquote'; text: string }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'paragraph'; text: string };

/** Inline-level AST nodes (recursive spans within a block). */
export type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'strong'; children: InlineNode[] }
  | { type: 'em'; children: InlineNode[] }
  | { type: 'strike'; children: InlineNode[] }
  | { type: 'code'; value: string }
  | { type: 'link'; url: string; children: InlineNode[] }
  | { type: 'image'; alt: string; src: string }
  | { type: 'break' };

/** A single `<li>`-equivalent entry inside a `list` block node. */
export interface ListItemNode {
  type: 'listItem';
  children: InlineNode[];
}

/** Block-level AST nodes making up a document's `children`. */
export type BlockNode =
  | { type: 'heading'; level: number; children: InlineNode[] }
  | { type: 'paragraph'; children: InlineNode[] }
  | { type: 'blockquote'; children: InlineNode[] }
  | { type: 'codeBlock'; lang: string; code: string }
  | { type: 'hr' }
  | { type: 'list'; ordered: boolean; items: ListItemNode[] }
  | { type: 'table'; header: InlineNode[][]; rows: InlineNode[][][] };

/** The root AST node produced by `parse()`. */
export interface MarkdownDocument {
  type: 'document';
  children: BlockNode[];
}
