import type { FormulaFunction } from '../types';
import { err, isError } from '../evaluator';

export const infoFunctions: Record<string, FormulaFunction> = {
  ISBLANK: (args) => {
    const v = args[0];
    return v === '' || v === 0 || v === undefined || v === null;
  },

  ISNUMBER: (args) => typeof args[0] === 'number',

  ISTEXT: (args) => typeof args[0] === 'string' && args[0] !== '',

  ISLOGICAL: (args) => typeof args[0] === 'boolean',

  ISERROR: (args) => isError(args[0]),

  ISERR: (args) => isError(args[0]) && args[0].code !== '#N/A',

  ISNA: (args) => isError(args[0]) && args[0].code === '#N/A',

  ISODD: (args) => {
    if (typeof args[0] !== 'number') return false;
    return Math.floor(Math.abs(args[0])) % 2 === 1;
  },

  ISEVEN: (args) => {
    if (typeof args[0] !== 'number') return false;
    return Math.floor(Math.abs(args[0])) % 2 === 0;
  },

  TYPE: (args) => {
    const v = args[0];
    if (typeof v === 'number') return 1;
    if (typeof v === 'string') return 2;
    if (typeof v === 'boolean') return 4;
    if (isError(v)) return 16;
    if (Array.isArray(v)) return 64;
    return 1;
  },

  N: (args) => {
    const v = args[0];
    if (typeof v === 'number') return v;
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (isError(v)) return v;
    return 0;
  },

  NA: () => err('#N/A'),

  'ERROR.TYPE': (args) => {
    const v = args[0];
    if (!isError(v)) return err('#N/A');
    switch (v.code) {
      case '#NULL!': return 1;
      case '#DIV/0!': return 2;
      case '#VALUE!': return 3;
      case '#REF!': return 4;
      case '#NAME?': return 5;
      case '#NUM!': return 6;
      case '#N/A': return 7;
      default: return 8;
    }
  },

  ISFORMULA: () => {
    // Can't determine from evaluated value alone — always return false
    return false;
  },

  ISNONTEXT: (args) => typeof args[0] !== 'string' || args[0] === '',

  ISREF: () => {
    // After evaluation, refs are resolved — always true if we got here
    return true;
  },
};
