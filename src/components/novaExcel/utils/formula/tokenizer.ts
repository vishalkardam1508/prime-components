import type { Token, TokenType } from './types';

const COMPARATORS = ['>=', '<=', '<>', '!=', '>', '<', '='];
const OPERATORS = ['+', '-', '*', '/', '^', '%'];

export function tokenize(formula: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const src = formula.startsWith('=') ? formula.slice(1) : formula;

  while (i < src.length) {
    const ch = src[i];

    // Whitespace
    if (ch === ' ' || ch === '\t') { i++; continue; }

    // String literal
    if (ch === '"') {
      let str = '';
      i++;
      while (i < src.length && src[i] !== '"') {
        if (src[i] === '"' && src[i + 1] === '"') { str += '"'; i += 2; }
        else { str += src[i]; i++; }
      }
      i++; // closing quote
      tokens.push({ type: 'STRING', value: str });
      continue;
    }

    // Number
    if (isDigit(ch) || (ch === '.' && i + 1 < src.length && isDigit(src[i + 1]))) {
      let num = '';
      while (i < src.length && (isDigit(src[i]) || src[i] === '.')) { num += src[i]; i++; }
      // Scientific notation
      if (i < src.length && (src[i] === 'e' || src[i] === 'E')) {
        num += src[i]; i++;
        if (i < src.length && (src[i] === '+' || src[i] === '-')) { num += src[i]; i++; }
        while (i < src.length && isDigit(src[i])) { num += src[i]; i++; }
      }
      tokens.push({ type: 'NUMBER', value: num });
      continue;
    }

    // Comparators (multi-char first)
    const comp = COMPARATORS.find((c) => src.slice(i, i + c.length) === c);
    if (comp != null) {
      tokens.push({ type: 'COMPARATOR', value: comp === '!=' ? '<>' : comp });
      i += comp.length;
      continue;
    }

    // Operators
    if (OPERATORS.includes(ch)) {
      tokens.push({ type: 'OPERATOR', value: ch });
      i++;
      continue;
    }

    // Ampersand (concat)
    if (ch === '&') { tokens.push({ type: 'AMPERSAND', value: '&' }); i++; continue; }

    // Parens, comma, colon, semicolon
    if (ch === '(') { tokens.push({ type: 'LPAREN', value: '(' }); i++; continue; }
    if (ch === ')') { tokens.push({ type: 'RPAREN', value: ')' }); i++; continue; }
    if (ch === ',') { tokens.push({ type: 'COMMA', value: ',' }); i++; continue; }
    if (ch === ';') { tokens.push({ type: 'SEMICOLON', value: ';' }); i++; continue; }
    if (ch === ':') { tokens.push({ type: 'COLON', value: ':' }); i++; continue; }

    // Sheet reference: 'Sheet Name'!A1 or Sheet1!A1
    if (ch === "'") {
      let sheet = '';
      i++;
      while (i < src.length && src[i] !== "'") { sheet += src[i]; i++; }
      i++; // closing quote
      if (i < src.length && src[i] === '!') {
        i++; // skip !
        let ref = '';
        while (i < src.length && isAlphaNum(src[i])) { ref += src[i]; i++; }
        tokens.push({ type: 'SHEET_REF', value: `${sheet}!${ref}` });
      }
      continue;
    }

    // Identifiers: cell refs, function names, booleans, sheet refs (unquoted)
    if (isAlpha(ch) || ch === '_' || ch === '$') {
      let ident = '';
      while (i < src.length && (isAlphaNum(src[i]) || src[i] === '_' || src[i] === '$')) {
        ident += src[i]; i++;
      }

      // Check for unquoted sheet ref: Sheet1!A1
      if (i < src.length && src[i] === '!') {
        i++; // skip !
        let ref = '';
        while (i < src.length && (isAlphaNum(src[i]) || src[i] === '$')) { ref += src[i]; i++; }
        tokens.push({ type: 'SHEET_REF', value: `${ident}!${ref}` });
        continue;
      }

      // Boolean
      if (ident.toUpperCase() === 'TRUE') { tokens.push({ type: 'BOOLEAN', value: 'TRUE' }); continue; }
      if (ident.toUpperCase() === 'FALSE') { tokens.push({ type: 'BOOLEAN', value: 'FALSE' }); continue; }

      // Function (followed by paren)
      if (i < src.length && src[i] === '(') {
        tokens.push({ type: 'FUNCTION', value: ident.toUpperCase() });
        continue;
      }

      // Cell ref (strip $ for absolute refs)
      tokens.push({ type: 'CELL_REF', value: ident.replace(/\$/g, '') });
      continue;
    }

    // Unknown char — skip
    i++;
  }

  tokens.push({ type: 'EOF', value: '' });
  return tokens;
}

function isDigit(ch: string): boolean { return ch >= '0' && ch <= '9'; }
function isAlpha(ch: string): boolean { return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z'); }
function isAlphaNum(ch: string): boolean { return isDigit(ch) || isAlpha(ch) || ch === '$'; }
