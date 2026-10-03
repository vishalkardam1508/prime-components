import type { ASTNode, CellRefNode, FormulaContext, FormulaError, FormulaValue, RangeNode } from './types';
import { registry } from './registry';

const MAX_DEPTH = 100;

// Lazy parser reference to avoid circular dependency
let _parseFormula: ((formula: string) => ASTNode) | null = null;
export function setParserRef(fn: (formula: string) => ASTNode): void { _parseFormula = fn; }
function getParser(): (formula: string) => ASTNode {
  if (_parseFormula == null) throw new Error('Parser not initialized');
  return _parseFormula;
}

export function evaluate(node: ASTNode, ctx: FormulaContext): FormulaValue {
  if (ctx.depth > MAX_DEPTH) return err('#CYCLE!');

  switch (node.kind) {
    case 'number': return node.value;
    case 'string': return node.value;
    case 'boolean': return node.value;
    case 'cellRef': return resolveCellRef(node, ctx);
    case 'range': return resolveRange(node, ctx);
    case 'concat': {
      const l = evaluate(node.left, ctx);
      const r = evaluate(node.right, ctx);
      if (isError(l)) return l;
      if (isError(r)) return r;
      return String(toDisplay(l)) + String(toDisplay(r));
    }
    case 'unaryOp': {
      const val = evaluate(node.operand, ctx);
      if (isError(val)) return val;
      const n = toNumber(val);
      if (n === null) return err('#VALUE!');
      return node.op === '-' ? -n : n;
    }
    case 'binaryOp': return evalBinaryOp(node.op, node.left, node.right, ctx);
    case 'functionCall': return evalFunction(node.name, node.args, ctx);
  }
}

function evalBinaryOp(op: string, leftNode: ASTNode, rightNode: ASTNode, ctx: FormulaContext): FormulaValue {
  const left = evaluate(leftNode, ctx);
  const right = evaluate(rightNode, ctx);
  if (isError(left)) return left;
  if (isError(right)) return right;

  // Comparators
  if (op === '=' || op === '<>' || op === '>' || op === '<' || op === '>=' || op === '<=') {
    return evalComparison(op, left, right);
  }

  // Arithmetic
  const l = toNumber(left);
  const r = toNumber(right);
  if (l === null || r === null) return err('#VALUE!');

  switch (op) {
    case '+': return l + r;
    case '-': return l - r;
    case '*': return l * r;
    case '/': return r === 0 ? err('#DIV/0!') : l / r;
    case '^': return Math.pow(l, r);
    default: return err('#VALUE!');
  }
}

function evalComparison(op: string, left: FormulaValue, right: FormulaValue): boolean {
  const l = typeof left === 'string' ? left.toLowerCase() : left;
  const r = typeof right === 'string' ? right.toLowerCase() : right;

  switch (op) {
    case '=': return l === r;
    case '<>': return l !== r;
    case '>': return (l as number) > (r as number);
    case '<': return (l as number) < (r as number);
    case '>=': return (l as number) >= (r as number);
    case '<=': return (l as number) <= (r as number);
    default: return false;
  }
}

function evalFunction(name: string, argNodes: ASTNode[], ctx: FormulaContext): FormulaValue {
  const fn = registry[name];
  if (fn == null) return err('#NAME?');

  // Evaluate args — ranges stay as arrays, scalars resolve
  const args: FormulaValue[] = argNodes.map((node) => {
    if (node.kind === 'range') return resolveRange(node, ctx);
    const val = evaluate(node, ctx);
    return val;
  });

  return fn(args, ctx);
}

// ─── Cell Resolution ─────────────────────────────────────────────────────────

function resolveCellRef(ref: CellRefNode, ctx: FormulaContext): FormulaValue {
  const sheetData = ref.sheet != null
    ? ctx.sheets.find((s) => s.name.toLowerCase() === ref.sheet!.toLowerCase())
    : ctx.sheets[ctx.activeSheetIndex];

  if (sheetData == null) return err('#REF!');

  const colNum = colLetterToNum(ref.col);
  const key = `r${ref.row}c${colNum}`;

  // Circular reference check
  const fullKey = `${sheetData.name}!${key}`;
  if (ctx.visited.has(fullKey)) return err('#CYCLE!');

  const raw = sheetData.cells[key];
  if (raw == null || raw === '') return 0;

  // If it's a formula, evaluate recursively
  if (raw.startsWith('=')) {
    ctx.visited.add(fullKey);
    const ast = getParser()(raw);
    const sheetIdx = ctx.sheets.indexOf(sheetData);
    const result = evaluate(ast, { ...ctx, activeSheetIndex: sheetIdx, depth: ctx.depth + 1 });
    ctx.visited.delete(fullKey);
    return result;
  }

  // Try number
  const n = Number(raw);
  if (!isNaN(n) && raw.trim() !== '') return n;

  // Boolean
  if (raw.toUpperCase() === 'TRUE') return true;
  if (raw.toUpperCase() === 'FALSE') return false;

  return raw;
}

function resolveRange(node: RangeNode, ctx: FormulaContext): FormulaValue[] {
  const sheet = node.start.sheet ?? node.end.sheet;
  const sheetData = sheet != null
    ? ctx.sheets.find((s) => s.name.toLowerCase() === sheet.toLowerCase())
    : ctx.sheets[ctx.activeSheetIndex];

  if (sheetData == null) return [err('#REF!')];

  const c1 = colLetterToNum(node.start.col);
  const c2 = colLetterToNum(node.end.col);
  const r1 = Math.min(node.start.row, node.end.row);
  const r2 = Math.max(node.start.row, node.end.row);
  const colStart = Math.min(c1, c2);
  const colEnd = Math.max(c1, c2);

  const values: FormulaValue[] = [];
  for (let r = r1; r <= r2; r++) {
    for (let c = colStart; c <= colEnd; c++) {
      const ref: CellRefNode = { kind: 'cellRef', sheet: sheetData.name, col: numToColLetter(c), row: r };
      values.push(resolveCellRef(ref, ctx));
    }
  }
  return values;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

export function colLetterToNum(col: string): number {
  let n = 0;
  for (let i = 0; i < col.length; i++) {
    n = n * 26 + (col.charCodeAt(i) - 64);
  }
  return n;
}

function numToColLetter(n: number): string {
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export function isError(v: FormulaValue): v is FormulaError {
  return v != null && typeof v === 'object' && !Array.isArray(v) && (v as FormulaError).type === 'error';
}

export function err(code: FormulaError['code'], message?: string): FormulaError {
  return { type: 'error', code, message };
}

export function toNumber(v: FormulaValue): number | null {
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (typeof v === 'string') {
    if (v === '') return 0;
    const n = Number(v);
    return isNaN(n) ? null : n;
  }
  return null;
}

export function toDisplay(v: FormulaValue): string | number {
  if (isError(v)) return v.code;
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (Array.isArray(v)) return toDisplay(v[0] ?? 0);
  return v;
}

/** Flatten nested arrays and scalar values into a flat number array (for aggregate functions) */
export function flattenToNumbers(args: FormulaValue[]): number[] {
  const nums: number[] = [];
  for (const arg of args) {
    if (Array.isArray(arg)) {
      nums.push(...flattenToNumbers(arg));
    } else if (typeof arg === 'number') {
      nums.push(arg);
    } else if (typeof arg === 'boolean') {
      nums.push(arg ? 1 : 0);
    } else if (typeof arg === 'string' && arg !== '') {
      const n = Number(arg);
      if (!isNaN(n)) nums.push(n);
    }
    // skip errors and empty strings
  }
  return nums;
}

/** Flatten args to all values (including strings, for COUNT/COUNTA) */
export function flattenAll(args: FormulaValue[]): FormulaValue[] {
  const out: FormulaValue[] = [];
  for (const arg of args) {
    if (Array.isArray(arg)) out.push(...flattenAll(arg));
    else out.push(arg);
  }
  return out;
}
