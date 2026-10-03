import type { CellsMap } from '../../types/novaExcel.types';

// ─── Tokens ──────────────────────────────────────────────────────────────────

export type TokenType =
  | 'NUMBER' | 'STRING' | 'BOOLEAN' | 'CELL_REF' | 'SHEET_REF'
  | 'RANGE' | 'FUNCTION' | 'OPERATOR' | 'COMPARATOR'
  | 'LPAREN' | 'RPAREN' | 'COMMA' | 'COLON' | 'AMPERSAND'
  | 'SEMICOLON' | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
}

// ─── AST Nodes ───────────────────────────────────────────────────────────────

export type ASTNode =
  | NumberNode
  | StringNode
  | BooleanNode
  | CellRefNode
  | RangeNode
  | FunctionCallNode
  | BinaryOpNode
  | UnaryOpNode
  | ConcatNode;

export interface NumberNode { kind: 'number'; value: number }
export interface StringNode { kind: 'string'; value: string }
export interface BooleanNode { kind: 'boolean'; value: boolean }
export interface CellRefNode { kind: 'cellRef'; sheet: string | null; col: string; row: number }
export interface RangeNode { kind: 'range'; start: CellRefNode; end: CellRefNode }
export interface FunctionCallNode { kind: 'functionCall'; name: string; args: ASTNode[] }
export interface BinaryOpNode { kind: 'binaryOp'; op: string; left: ASTNode; right: ASTNode }
export interface UnaryOpNode { kind: 'unaryOp'; op: string; operand: ASTNode }
export interface ConcatNode { kind: 'concat'; left: ASTNode; right: ASTNode }

// ─── Formula Context ─────────────────────────────────────────────────────────

export interface SheetData {
  name: string;
  cells: CellsMap;
}

export interface FormulaContext {
  sheets: SheetData[];
  activeSheetIndex: number;
  /** Track visited cells to detect circular refs */
  visited: Set<string>;
  /** Current evaluation depth */
  depth: number;
}

// ─── Formula Value (result of evaluation) ────────────────────────────────────

export type FormulaValue = number | string | boolean | FormulaError | FormulaValue[];

export interface FormulaError {
  type: 'error';
  code: '#VALUE!' | '#REF!' | '#NAME?' | '#DIV/0!' | '#N/A' | '#NUM!' | '#NULL!' | '#CYCLE!';
  message?: string;
}

// ─── Function Definition ─────────────────────────────────────────────────────

export type FormulaFunction = (args: FormulaValue[], context: FormulaContext) => FormulaValue;

export type FunctionRegistry = Record<string, FormulaFunction>;
