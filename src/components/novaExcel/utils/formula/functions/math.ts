import type { FormulaFunction, FormulaValue } from '../types';
import { err, flattenToNumbers, isError, toNumber } from '../evaluator';

export const mathFunctions: Record<string, FormulaFunction> = {
  SUM: (args) => {
    const nums = flattenToNumbers(args);
    return nums.reduce((s, n) => s + n, 0);
  },

  SUMIF: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const range = Array.isArray(args[0]) ? args[0] : [args[0]];
    const criteria = args[1];
    const sumRange = args.length >= 3 && Array.isArray(args[2]) ? args[2] : range;
    let sum = 0;
    for (let i = 0; i < range.length; i++) {
      if (matchesCriteria(range[i], criteria)) {
        const v = toNumber(sumRange[i] ?? 0);
        if (v !== null) sum += v;
      }
    }
    return sum;
  },

  SUMIFS: (args) => {
    if (args.length < 3 || args.length % 2 === 0) return err('#VALUE!');
    const sumRange = Array.isArray(args[0]) ? args[0] : [args[0]];
    let sum = 0;
    for (let i = 0; i < sumRange.length; i++) {
      let match = true;
      for (let p = 1; p < args.length; p += 2) {
        const criteriaRange = Array.isArray(args[p]) ? args[p] : [args[p]];
        const criteria = args[p + 1];
        if (!matchesCriteria(criteriaRange[i] ?? '', criteria)) { match = false; break; }
      }
      if (match) {
        const v = toNumber(sumRange[i] ?? 0);
        if (v !== null) sum += v;
      }
    }
    return sum;
  },

  SUMPRODUCT: (args) => {
    if (args.length === 0) return 0;
    const arrays = args.map((a) => Array.isArray(a) ? a : [a]);
    const len = Math.max(...arrays.map((a) => a.length));
    let sum = 0;
    for (let i = 0; i < len; i++) {
      let product = 1;
      for (const arr of arrays) {
        const v = toNumber(arr[i] ?? 0);
        product *= v ?? 0;
      }
      sum += product;
    }
    return sum;
  },

  ABS: (args) => {
    const n = toNumber(args[0] ?? 0);
    return n === null ? err('#VALUE!') : Math.abs(n);
  },

  ROUND: (args) => {
    const n = toNumber(args[0] ?? 0);
    const d = toNumber(args[1] ?? 0);
    if (n === null || d === null) return err('#VALUE!');
    const factor = Math.pow(10, d);
    return Math.round(n * factor) / factor;
  },

  ROUNDUP: (args) => {
    const n = toNumber(args[0] ?? 0);
    const d = toNumber(args[1] ?? 0);
    if (n === null || d === null) return err('#VALUE!');
    const factor = Math.pow(10, d);
    return Math.sign(n) * Math.ceil(Math.abs(n) * factor) / factor;
  },

  ROUNDDOWN: (args) => {
    const n = toNumber(args[0] ?? 0);
    const d = toNumber(args[1] ?? 0);
    if (n === null || d === null) return err('#VALUE!');
    const factor = Math.pow(10, d);
    return Math.sign(n) * Math.floor(Math.abs(n) * factor) / factor;
  },

  CEILING: (args) => {
    const n = toNumber(args[0] ?? 0);
    const sig = toNumber(args[1] ?? 1);
    if (n === null || sig === null || sig === 0) return err('#VALUE!');
    return Math.ceil(n / sig) * sig;
  },

  FLOOR: (args) => {
    const n = toNumber(args[0] ?? 0);
    const sig = toNumber(args[1] ?? 1);
    if (n === null || sig === null || sig === 0) return err('#VALUE!');
    return Math.floor(n / sig) * sig;
  },

  POWER: (args) => {
    const base = toNumber(args[0] ?? 0);
    const exp = toNumber(args[1] ?? 0);
    if (base === null || exp === null) return err('#VALUE!');
    return Math.pow(base, exp);
  },

  SQRT: (args) => {
    const n = toNumber(args[0] ?? 0);
    if (n === null || n < 0) return err('#NUM!');
    return Math.sqrt(n);
  },

  MOD: (args) => {
    const n = toNumber(args[0] ?? 0);
    const d = toNumber(args[1] ?? 0);
    if (n === null || d === null || d === 0) return err('#DIV/0!');
    return n - d * Math.floor(n / d);
  },

  INT: (args) => {
    const n = toNumber(args[0] ?? 0);
    if (n === null) return err('#VALUE!');
    return Math.floor(n);
  },

  RAND: () => Math.random(),

  RANDBETWEEN: (args) => {
    const lo = toNumber(args[0] ?? 0);
    const hi = toNumber(args[1] ?? 0);
    if (lo === null || hi === null) return err('#VALUE!');
    return Math.floor(Math.random() * (hi - lo + 1)) + lo;
  },

  PI: () => Math.PI,

  LOG: (args) => {
    const n = toNumber(args[0] ?? 0);
    const base = toNumber(args[1] ?? 10);
    if (n === null || base === null || n <= 0 || base <= 0 || base === 1) return err('#NUM!');
    return Math.log(n) / Math.log(base);
  },

  LOG10: (args) => {
    const n = toNumber(args[0] ?? 0);
    if (n === null || n <= 0) return err('#NUM!');
    return Math.log10(n);
  },

  LN: (args) => {
    const n = toNumber(args[0] ?? 0);
    if (n === null || n <= 0) return err('#NUM!');
    return Math.log(n);
  },

  EXP: (args) => {
    const n = toNumber(args[0] ?? 0);
    if (n === null) return err('#VALUE!');
    return Math.exp(n);
  },

  SIGN: (args) => {
    const n = toNumber(args[0] ?? 0);
    if (n === null) return err('#VALUE!');
    return Math.sign(n);
  },

  PRODUCT: (args) => {
    const nums = flattenToNumbers(args);
    if (nums.length === 0) return 0;
    return nums.reduce((p, n) => p * n, 1);
  },

  QUOTIENT: (args) => {
    const n = toNumber(args[0] ?? 0);
    const d = toNumber(args[1] ?? 0);
    if (n === null || d === null || d === 0) return err('#DIV/0!');
    return Math.trunc(n / d);
  },
};

// ─── Criteria matching helper ────────────────────────────────────────────────

export function matchesCriteria(cellValue: FormulaValue, criteria: FormulaValue): boolean {
  if (isError(cellValue) || isError(criteria)) return false;
  if (Array.isArray(cellValue)) cellValue = cellValue[0] ?? 0;
  if (Array.isArray(criteria)) criteria = criteria[0] ?? '';

  const critStr = String(criteria);

  // Operator criteria: ">5", "<=10", "<>abc"
  const opMatch = critStr.match(/^(>=|<=|<>|!=|>|<|=)(.*)$/);
  if (opMatch != null) {
    const op = opMatch[1];
    const val = opMatch[2];
    const cellNum = toNumber(cellValue);
    const critNum = Number(val);
    const useNum = cellNum !== null && !isNaN(critNum) && val !== '';

    switch (op) {
      case '>': return useNum ? cellNum! > critNum : String(cellValue) > val;
      case '<': return useNum ? cellNum! < critNum : String(cellValue) < val;
      case '>=': return useNum ? cellNum! >= critNum : String(cellValue) >= val;
      case '<=': return useNum ? cellNum! <= critNum : String(cellValue) <= val;
      case '<>': case '!=': return useNum ? cellNum! !== critNum : String(cellValue).toLowerCase() !== val.toLowerCase();
      case '=': return useNum ? cellNum! === critNum : String(cellValue).toLowerCase() === val.toLowerCase();
    }
  }

  // Wildcard criteria: * and ?
  if (critStr.includes('*') || critStr.includes('?')) {
    const regex = new RegExp('^' + critStr.replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
    return regex.test(String(cellValue));
  }

  // Direct comparison
  const cellNum = toNumber(cellValue);
  const critNum = Number(critStr);
  if (cellNum !== null && !isNaN(critNum) && critStr !== '') return cellNum === critNum;
  return String(cellValue).toLowerCase() === critStr.toLowerCase();
}
