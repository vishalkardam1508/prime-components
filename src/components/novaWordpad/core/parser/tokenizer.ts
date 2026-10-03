/**
 * Minimal cursor-based scanner over a string. Not Markdown-specific —
 * any line/character based lexer in the app can build on this.
 */
export class Scanner {
  input: string;
  pos: number;

  constructor(input: string) {
    this.input = input;
    this.pos = 0;
  }

  get eof(): boolean {
    return this.pos >= this.input.length;
  }

  peek(offset = 0): string | undefined {
    return this.input[this.pos + offset];
  }

  match(str: string): boolean {
    return this.input.startsWith(str, this.pos);
  }

  matchRegex(regex: RegExp): RegExpExecArray | null {
    const sub = this.input.slice(this.pos);
    const anchored = new RegExp(`^(?:${regex.source})`, regex.flags.replace('g', ''));
    return anchored.exec(sub);
  }

  advance(count = 1): string {
    const chunk = this.input.slice(this.pos, this.pos + count);
    this.pos += count;
    return chunk;
  }

  advanceWhile(predicate: (char: string) => boolean): string {
    let chunk = '';
    while (!this.eof && predicate(this.peek() as string)) {
      chunk += this.advance();
    }
    return chunk;
  }

  rest(): string {
    return this.input.slice(this.pos);
  }
}

/** Splits raw source into lines, preserving blank lines for block parsing. */
export function toLines(source: string): string[] {
  return source.replace(/\r\n?/g, '\n').split('\n');
}
