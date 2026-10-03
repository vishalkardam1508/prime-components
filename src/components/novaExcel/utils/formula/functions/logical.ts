import type { FormulaFunction, FormulaValue } from '../types';
import { err, isError, toNumber, flattenAll } from '../evaluator';

export const logicalFunctions: Record<string, FormulaFunction> = {
  IF: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const condition = args[0];
    const isTruthy = isTruthyValue(condition);
    if (isTruthy) return args[1] ?? true;
    return args[2] ?? false;
  },

  IFS: (args) => {
    if (args.length < 2 || args.length % 2 !== 0) return err('#VALUE!');
    for (let i = 0; i < args.length; i += 2) {
      if (isTruthyValue(args[i])) return args[i + 1];
    }
    return err('#N/A');
  },

  AND: (args) => {
    const all = flattenAll(args);
    if (all.length === 0) return err('#VALUE!');
    for (const v of all) {
      if (isError(v)) return v;
      if (!isTruthyValue(v)) return false;
    }
    return true;
  },

  OR: (args) => {
    const all = flattenAll(args);
    if (all.length === 0) return err('#VALUE!');
    for (const v of all) {
      if (isError(v)) return v;
      if (isTruthyValue(v)) return true;
    }
    return false;
  },

  XOR: (args) => {
    const all = flattenAll(args);
    if (all.length === 0) return err('#VALUE!');
    let trueCount = 0;
    for (const v of all) {
      if (isError(v)) return v;
      if (isTruthyValue(v)) trueCount++;
    }
    return trueCount % 2 === 1;
  },

  NOT: (args) => {
    if (args.length === 0) return err('#VALUE!');
    return !isTruthyValue(args[0]);
  },

  IFERROR: (args) => {
    if (args.length < 1) return err('#VALUE!');
    const val = args[0];
    if (isError(val)) return args[1] ?? '';
    return val;
  },

  IFNA: (args) => {
    if (args.length < 1) return err('#VALUE!');
    const val = args[0];
    if (isError(val) && val.code === '#N/A') return args[1] ?? '';
    return val;
  },

  SWITCH: (args) => {
    if (args.length < 3) return err('#VALUE!');
    const expr = args[0];
    for (let i = 1; i < args.length - 1; i += 2) {
      if (valuesEqual(expr, args[i])) return args[i + 1];
    }
    // Default value (odd number of remaining args)
    if (args.length % 2 === 0) return args[args.length - 1];
    return err('#N/A');
  },

  TRUE: () => true,
  FALSE: () => false,

  CHOOSE: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const idx = toNumber(args[0] ?? 0);
    if (idx === null || idx < 1 || idx >= args.length) return err('#VALUE!');
    return args[idx];
  },
};

function isTruthyValue(v: FormulaValue): boolean {
  if (isError(v)) return false;
  if (Array.isArray(v)) return v.length > 0 && isTruthyValue(v[0]);
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') return v.toUpperCase() === 'TRUE' || (v !== '' && v !== '0');
  return false;
}

function valuesEqual(a: FormulaValue, b: FormulaValue): boolean {
  if (isError(a) || isError(b)) return false;
  if (Array.isArray(a)) a = a[0] ?? 0;
  if (Array.isArray(b)) b = b[0] ?? 0;
  if (typeof a === 'string' && typeof b === 'string') return a.toLowerCase() === b.toLowerCase();
  return a === b;
}
