import type { Token, ASTNode, CellRefNode } from './types';
import { tokenize } from './tokenizer';

class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  private peek(): Token { return this.tokens[this.pos] ?? { type: 'EOF', value: '' }; }
  private advance(): Token { return this.tokens[this.pos++] ?? { type: 'EOF', value: '' }; }
  private expect(type: string): Token {
    const t = this.advance();
    if (t.type !== type) throw new Error(`Expected ${type}, got ${t.type}`);
    return t;
  }

  parse(): ASTNode {
    const node = this.parseExpression();
    return node;
  }

  // Expression: comparison level
  private parseExpression(): ASTNode {
    return this.parseConcat();
  }

  // Concatenation (&)
  private parseConcat(): ASTNode {
    let left = this.parseComparison();
    while (this.peek().type === 'AMPERSAND') {
      this.advance();
      const right = this.parseComparison();
      left = { kind: 'concat', left, right };
    }
    return left;
  }

  // Comparison: =, <>, <, >, <=, >=
  private parseComparison(): ASTNode {
    let left = this.parseAddSub();
    while (this.peek().type === 'COMPARATOR') {
      const op = this.advance().value;
      const right = this.parseAddSub();
      left = { kind: 'binaryOp', op, left, right };
    }
    return left;
  }

  // Addition / Subtraction
  private parseAddSub(): ASTNode {
    let left = this.parseMulDiv();
    while (this.peek().type === 'OPERATOR' && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.advance().value;
      const right = this.parseMulDiv();
      left = { kind: 'binaryOp', op, left, right };
    }
    return left;
  }

  // Multiplication / Division
  private parseMulDiv(): ASTNode {
    let left = this.parsePower();
    while (this.peek().type === 'OPERATOR' && (this.peek().value === '*' || this.peek().value === '/')) {
      const op = this.advance().value;
      const right = this.parsePower();
      left = { kind: 'binaryOp', op, left, right };
    }
    return left;
  }

  // Power (^)
  private parsePower(): ASTNode {
    let left = this.parseUnary();
    while (this.peek().type === 'OPERATOR' && this.peek().value === '^') {
      this.advance();
      const right = this.parseUnary();
      left = { kind: 'binaryOp', op: '^', left, right };
    }
    return left;
  }

  // Unary (-, +)
  private parseUnary(): ASTNode {
    if (this.peek().type === 'OPERATOR' && (this.peek().value === '-' || this.peek().value === '+')) {
      const op = this.advance().value;
      const operand = this.parseUnary();
      return { kind: 'unaryOp', op, operand };
    }
    return this.parsePercent();
  }

  // Percent (%)
  private parsePercent(): ASTNode {
    let node = this.parsePrimary();
    while (this.peek().type === 'OPERATOR' && this.peek().value === '%') {
      this.advance();
      node = { kind: 'binaryOp', op: '/', left: node, right: { kind: 'number', value: 100 } };
    }
    return node;
  }

  // Primary: number, string, boolean, cell ref, range, function call, parens
  private parsePrimary(): ASTNode {
    const t = this.peek();

    // Number
    if (t.type === 'NUMBER') {
      this.advance();
      return { kind: 'number', value: parseFloat(t.value) };
    }

    // String
    if (t.type === 'STRING') {
      this.advance();
      return { kind: 'string', value: t.value };
    }

    // Boolean
    if (t.type === 'BOOLEAN') {
      this.advance();
      return { kind: 'boolean', value: t.value === 'TRUE' };
    }

    // Function call
    if (t.type === 'FUNCTION') {
      this.advance();
      this.expect('LPAREN');
      const args: ASTNode[] = [];
      if (this.peek().type !== 'RPAREN') {
        args.push(this.parseExpression());
        while (this.peek().type === 'COMMA' || this.peek().type === 'SEMICOLON') {
          this.advance();
          args.push(this.parseExpression());
        }
      }
      this.expect('RPAREN');
      return { kind: 'functionCall', name: t.value, args };
    }

    // Sheet reference (Sheet1!A1)
    if (t.type === 'SHEET_REF') {
      this.advance();
      const [sheet, ref] = splitSheetRef(t.value);
      const cellRef = parseCellRef(ref, sheet);

      // Check for range (Sheet1!A1:B5)
      if (this.peek().type === 'COLON') {
        this.advance();
        const endToken = this.peek();
        if (endToken.type === 'CELL_REF') {
          this.advance();
          const endRef = parseCellRef(endToken.value, sheet);
          return { kind: 'range', start: cellRef, end: endRef };
        } else if (endToken.type === 'SHEET_REF') {
          this.advance();
          const [, endRefStr] = splitSheetRef(endToken.value);
          const endRef = parseCellRef(endRefStr, sheet);
          return { kind: 'range', start: cellRef, end: endRef };
        }
      }
      return cellRef;
    }

    // Cell reference or range
    if (t.type === 'CELL_REF') {
      this.advance();
      const cellRef = parseCellRef(t.value, null);

      // Check for range (A1:B5)
      if (this.peek().type === 'COLON') {
        this.advance();
        const endToken = this.peek();
        if (endToken.type === 'CELL_REF') {
          this.advance();
          const endRef = parseCellRef(endToken.value, null);
          return { kind: 'range', start: cellRef, end: endRef };
        } else if (endToken.type === 'SHEET_REF') {
          this.advance();
          const [sheet, refStr] = splitSheetRef(endToken.value);
          const endRef = parseCellRef(refStr, sheet);
          return { kind: 'range', start: cellRef, end: endRef };
        }
      }
      return cellRef;
    }

    // Parenthesized expression
    if (t.type === 'LPAREN') {
      this.advance();
      const expr = this.parseExpression();
      this.expect('RPAREN');
      return expr;
    }

    throw new Error(`Unexpected token: ${t.type} (${t.value})`);
  }
}

function parseCellRef(ref: string, sheet: string | null): CellRefNode {
  const match = ref.match(/^([A-Za-z]+)(\d+)$/);
  if (match == null) throw new Error(`Invalid cell ref: ${ref}`);
  return { kind: 'cellRef', sheet, col: match[1].toUpperCase(), row: parseInt(match[2]) };
}

function splitSheetRef(value: string): [string, string] {
  const idx = value.lastIndexOf('!');
  return [value.slice(0, idx), value.slice(idx + 1)];
}

export function parseFormula(formula: string): ASTNode {
  const tokens = tokenize(formula);
  const parser = new Parser(tokens);
  return parser.parse();
}
