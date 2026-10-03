import type { FormulaFunction } from '../types';
import { err, toNumber } from '../evaluator';

export const referenceFunctions: Record<string, FormulaFunction> = {
  ROW: (args) => {
    // Without args, should return current row — but we don't have that context here
    // With a cell ref arg, it's already resolved to a value, so we can't extract row
    // This is a limitation — return 0 for no-arg case
    if (args.length === 0) return 0;
    return toNumber(args[0] ?? 0) ?? 0;
  },

  COLUMN: (args) => {
    if (args.length === 0) return 0;
    return toNumber(args[0] ?? 0) ?? 0;
  },

  ROWS: (args) => {
    if (!Array.isArray(args[0])) return 1;
    // Can't determine rows from flat array without knowing cols
    return args[0].length;
  },

  COLUMNS: (args) => {
    if (!Array.isArray(args[0])) return 1;
    return 1; // Flat array — can't determine without range metadata
  },

  ADDRESS: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const row = toNumber(args[0] ?? 0);
    const col = toNumber(args[1] ?? 0);
    const absNum = toNumber(args[2] ?? 1); // 1=abs, 2=abs row, 3=abs col, 4=relative
    const a1Style = args[3] !== false && args[3] !== 0;
    const sheet = args[4] != null ? String(args[4]) : '';

    if (row === null || col === null || row < 1 || col < 1) return err('#VALUE!');

    const colLetter = numToColLetter(col);

    let ref = '';
    if (a1Style) {
      const rowPrefix = absNum === 1 || absNum === 2 ? '$' : '';
      const colPrefix = absNum === 1 || absNum === 3 ? '$' : '';
      ref = `${colPrefix}${colLetter}${rowPrefix}${row}`;
    } else {
      ref = `R${row}C${col}`;
    }

    if (sheet !== '') return `'${sheet}'!${ref}`;
    return ref;
  },

  INDIRECT: (args) => {
    // INDIRECT resolves a string to a cell reference — but since we evaluate to values,
    // we can't dynamically resolve here without re-parsing. Return #REF! for now.
    // A full implementation would need the evaluator to handle this specially.
    if (args.length < 1) return err('#REF!');
    return err('#REF!');
  },

  OFFSET: (args) => {
    // OFFSET creates a dynamic range — similar limitation as INDIRECT
    if (args.length < 3) return err('#VALUE!');
    return err('#REF!');
  },
};

function numToColLetter(n: number): string {
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
