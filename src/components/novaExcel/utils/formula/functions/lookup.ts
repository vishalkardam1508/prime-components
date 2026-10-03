import type { FormulaFunction, FormulaValue } from '../types';
import { err, isError, toNumber, flattenAll } from '../evaluator';

export const lookupFunctions: Record<string, FormulaFunction> = {
  VLOOKUP: (args) => {
    if (args.length < 3) return err('#VALUE!');
    const lookupVal = args[0];
    const table = args[1];
    const colIdx = toNumber(args[2] ?? 1);
    const rangeLookup = args[3] !== false && args[3] !== 0; // default TRUE (approximate)

    if (!Array.isArray(table) || colIdx === null || colIdx < 1) return err('#VALUE!');

    // Determine table dimensions — table is a flat array from a range
    // We need to figure out the number of columns from context
    // For VLOOKUP, the table array is row-major from resolveRange
    // We'll infer cols from colIdx (user must provide correct range)
    const totalCells = table.length;
    if (totalCells === 0) return err('#N/A');

    // Heuristic: if colIdx > sqrt(totalCells), assume cols = colIdx minimum
    const cols = Math.max(colIdx, guessColCount(totalCells, colIdx));
    const rows = Math.floor(totalCells / cols);

    if (rangeLookup) {
      // Approximate match — binary search on first column (must be sorted)
      let lastMatch = -1;
      for (let r = 0; r < rows; r++) {
        const cellVal = table[r * cols];
        if (compareValues(cellVal, lookupVal) <= 0) lastMatch = r;
        else break;
      }
      if (lastMatch === -1) return err('#N/A');
      return table[lastMatch * cols + (colIdx - 1)] ?? err('#REF!');
    } else {
      // Exact match
      for (let r = 0; r < rows; r++) {
        const cellVal = table[r * cols];
        if (valuesEqual(cellVal, lookupVal)) {
          return table[r * cols + (colIdx - 1)] ?? err('#REF!');
        }
      }
      return err('#N/A');
    }
  },

  HLOOKUP: (args) => {
    if (args.length < 3) return err('#VALUE!');
    const lookupVal = args[0];
    const table = args[1];
    const rowIdx = toNumber(args[2] ?? 1);
    const rangeLookup = args[3] !== false && args[3] !== 0;

    if (!Array.isArray(table) || rowIdx === null || rowIdx < 1) return err('#VALUE!');

    const totalCells = table.length;
    if (totalCells === 0) return err('#N/A');

    // For HLOOKUP we need cols count — guess from first row match
    const cols = guessCols(table, lookupVal);
    const rows = Math.floor(totalCells / cols);

    if (rowIdx > rows) return err('#REF!');

    if (rangeLookup) {
      let lastMatch = -1;
      for (let c = 0; c < cols; c++) {
        if (compareValues(table[c], lookupVal) <= 0) lastMatch = c;
        else break;
      }
      if (lastMatch === -1) return err('#N/A');
      return table[(rowIdx - 1) * cols + lastMatch] ?? err('#REF!');
    } else {
      for (let c = 0; c < cols; c++) {
        if (valuesEqual(table[c], lookupVal)) {
          return table[(rowIdx - 1) * cols + c] ?? err('#REF!');
        }
      }
      return err('#N/A');
    }
  },

  INDEX: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const array = args[0];
    const rowNum = toNumber(args[1] ?? 0);
    const colNum = toNumber(args[2] ?? 1);

    if (!Array.isArray(array)) return array;
    if (rowNum === null) return err('#VALUE!');

    // Single column/row array
    if (rowNum > 0 && (colNum === null || colNum <= 1)) {
      const idx = rowNum - 1;
      return idx < array.length ? array[idx] : err('#REF!');
    }

    // 2D — need to know column count (use colNum as hint)
    if (colNum !== null && colNum > 0) {
      const cols = Math.max(colNum, 1);
      const idx = (rowNum - 1) * cols + (colNum - 1);
      return idx < array.length ? array[idx] : err('#REF!');
    }

    return err('#REF!');
  },

  MATCH: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const lookupVal = args[0];
    const lookupArray = Array.isArray(args[1]) ? args[1] : [args[1]];
    const matchType = toNumber(args[2] ?? 1); // 1=less than, 0=exact, -1=greater than

    if (matchType === 0) {
      // Exact match (supports wildcards)
      for (let i = 0; i < lookupArray.length; i++) {
        if (valuesEqual(lookupArray[i], lookupVal)) return i + 1;
      }
      // Wildcard support
      if (typeof lookupVal === 'string' && (lookupVal.includes('*') || lookupVal.includes('?'))) {
        const regex = new RegExp('^' + lookupVal.replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
        for (let i = 0; i < lookupArray.length; i++) {
          if (regex.test(String(lookupArray[i] ?? ''))) return i + 1;
        }
      }
      return err('#N/A');
    } else if (matchType === 1) {
      // Largest value <= lookup (array must be ascending)
      let lastMatch = -1;
      for (let i = 0; i < lookupArray.length; i++) {
        if (compareValues(lookupArray[i], lookupVal) <= 0) lastMatch = i;
        else break;
      }
      return lastMatch === -1 ? err('#N/A') : lastMatch + 1;
    } else {
      // Smallest value >= lookup (array must be descending)
      let lastMatch = -1;
      for (let i = 0; i < lookupArray.length; i++) {
        if (compareValues(lookupArray[i], lookupVal) >= 0) lastMatch = i;
        else break;
      }
      return lastMatch === -1 ? err('#N/A') : lastMatch + 1;
    }
  },

  XLOOKUP: (args) => {
    if (args.length < 3) return err('#VALUE!');
    const lookupVal = args[0];
    const lookupArray = Array.isArray(args[1]) ? args[1] : [args[1]];
    const returnArray = Array.isArray(args[2]) ? args[2] : [args[2]];
    const ifNotFound = args[3] ?? err('#N/A');
    const matchMode = toNumber(args[4] ?? 0); // 0=exact, -1=next smaller, 1=next larger, 2=wildcard
    const searchMode = toNumber(args[5] ?? 1); // 1=first-to-last, -1=last-to-first

    const start = searchMode === -1 ? lookupArray.length - 1 : 0;
    const end = searchMode === -1 ? -1 : lookupArray.length;
    const step = searchMode === -1 ? -1 : 1;

    let foundIdx = -1;

    if (matchMode === 0 || matchMode === 2) {
      // Exact or wildcard
      for (let i = start; i !== end; i += step) {
        if (matchMode === 2 && typeof lookupVal === 'string') {
          const regex = new RegExp('^' + String(lookupVal).replace(/\*/g, '.*').replace(/\?/g, '.') + '$', 'i');
          if (regex.test(String(lookupArray[i] ?? ''))) { foundIdx = i; break; }
        } else if (valuesEqual(lookupArray[i], lookupVal)) { foundIdx = i; break; }
      }
    } else if (matchMode === -1) {
      // Next smaller
      let best = -1;
      for (let i = 0; i < lookupArray.length; i++) {
        if (compareValues(lookupArray[i], lookupVal) <= 0) {
          if (best === -1 || compareValues(lookupArray[i], lookupArray[best]) > 0) best = i;
        }
      }
      foundIdx = best;
    } else if (matchMode === 1) {
      // Next larger
      let best = -1;
      for (let i = 0; i < lookupArray.length; i++) {
        if (compareValues(lookupArray[i], lookupVal) >= 0) {
          if (best === -1 || compareValues(lookupArray[i], lookupArray[best]) < 0) best = i;
        }
      }
      foundIdx = best;
    }

    if (foundIdx === -1) return isError(ifNotFound) ? ifNotFound : ifNotFound;
    return foundIdx < returnArray.length ? returnArray[foundIdx] : err('#REF!');
  },

  LOOKUP: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const lookupVal = args[0];
    const lookupVector = Array.isArray(args[1]) ? args[1] : [args[1]];
    const resultVector = args.length >= 3 && Array.isArray(args[2]) ? args[2] : lookupVector;

    // Find largest value <= lookupVal (vector must be sorted ascending)
    let lastMatch = -1;
    for (let i = 0; i < lookupVector.length; i++) {
      if (compareValues(lookupVector[i], lookupVal) <= 0) lastMatch = i;
      else break;
    }
    if (lastMatch === -1) return err('#N/A');
    return lastMatch < resultVector.length ? resultVector[lastMatch] : err('#REF!');
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function valuesEqual(a: FormulaValue, b: FormulaValue): boolean {
  if (isError(a) || isError(b)) return false;
  if (Array.isArray(a)) a = a[0] ?? 0;
  if (Array.isArray(b)) b = b[0] ?? 0;
  if (typeof a === 'string' && typeof b === 'string') return a.toLowerCase() === b.toLowerCase();
  return a === b;
}

function compareValues(a: FormulaValue, b: FormulaValue): number {
  if (Array.isArray(a)) a = a[0] ?? 0;
  if (Array.isArray(b)) b = b[0] ?? 0;
  const na = toNumber(a);
  const nb = toNumber(b);
  if (na !== null && nb !== null) return na - nb;
  return String(a ?? '').localeCompare(String(b ?? ''));
}

function guessColCount(total: number, minCols: number): number {
  // Try to find a reasonable column count
  for (let c = minCols; c <= total; c++) {
    if (total % c === 0) return c;
  }
  return minCols;
}

function guessCols(table: FormulaValue[], lookupVal: FormulaValue): number {
  // For HLOOKUP, try to find how many columns by checking where values repeat pattern
  // Fallback: assume square-ish
  const total = table.length;
  const sqrt = Math.ceil(Math.sqrt(total));
  for (let c = sqrt; c >= 2; c--) {
    if (total % c === 0) return c;
  }
  return total;
}
