import type { FormulaFunction } from '../types';
import { err, isError, toNumber, flattenAll } from '../evaluator';

export const textFunctions: Record<string, FormulaFunction> = {
  CONCATENATE: (args) => {
    const all = flattenAll(args);
    return all.map((v) => isError(v) ? '' : String(v === true ? 'TRUE' : v === false ? 'FALSE' : v)).join('');
  },

  CONCAT: (args) => textFunctions.CONCATENATE(args, {} as never),

  LEFT: (args) => {
    if (args.length < 1) return err('#VALUE!');
    const text = String(args[0] ?? '');
    const n = toNumber(args[1] ?? 1);
    if (n === null || n < 0) return err('#VALUE!');
    return text.slice(0, n);
  },

  RIGHT: (args) => {
    if (args.length < 1) return err('#VALUE!');
    const text = String(args[0] ?? '');
    const n = toNumber(args[1] ?? 1);
    if (n === null || n < 0) return err('#VALUE!');
    return text.slice(-n);
  },

  MID: (args) => {
    if (args.length < 3) return err('#VALUE!');
    const text = String(args[0] ?? '');
    const start = toNumber(args[1] ?? 0);
    const len = toNumber(args[2] ?? 0);
    if (start === null || len === null || start < 1 || len < 0) return err('#VALUE!');
    return text.slice(start - 1, start - 1 + len);
  },

  LEN: (args) => {
    if (args.length < 1) return 0;
    return String(args[0] ?? '').length;
  },

  UPPER: (args) => String(args[0] ?? '').toUpperCase(),
  LOWER: (args) => String(args[0] ?? '').toLowerCase(),

  PROPER: (args) => {
    const text = String(args[0] ?? '');
    return text.replace(/\b\w/g, (c) => c.toUpperCase());
  },

  TRIM: (args) => String(args[0] ?? '').trim().replace(/\s+/g, ' '),

  CLEAN: (args) => String(args[0] ?? '').replace(/[\x00-\x1F]/g, ''),

  SUBSTITUTE: (args) => {
    if (args.length < 3) return err('#VALUE!');
    const text = String(args[0] ?? '');
    const oldText = String(args[1] ?? '');
    const newText = String(args[2] ?? '');
    const instance = toNumber(args[3] ?? 0);

    if (oldText === '') return text;

    if (instance != null && instance > 0) {
      let count = 0;
      let idx = -1;
      let searchFrom = 0;
      while (count < instance) {
        idx = text.indexOf(oldText, searchFrom);
        if (idx === -1) return text;
        count++;
        searchFrom = idx + 1;
      }
      return text.slice(0, idx) + newText + text.slice(idx + oldText.length);
    }

    return text.split(oldText).join(newText);
  },

  FIND: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const findText = String(args[0] ?? '');
    const withinText = String(args[1] ?? '');
    const startNum = toNumber(args[2] ?? 1);
    if (startNum === null || startNum < 1) return err('#VALUE!');
    const idx = withinText.indexOf(findText, startNum - 1);
    return idx === -1 ? err('#VALUE!') : idx + 1;
  },

  SEARCH: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const findText = String(args[0] ?? '').toLowerCase();
    const withinText = String(args[1] ?? '').toLowerCase();
    const startNum = toNumber(args[2] ?? 1);
    if (startNum === null || startNum < 1) return err('#VALUE!');

    // Support wildcards
    if (findText.includes('*') || findText.includes('?')) {
      const regex = new RegExp(findText.replace(/\*/g, '.*').replace(/\?/g, '.'), 'i');
      const match = withinText.slice(startNum - 1).match(regex);
      if (match == null || match.index == null) return err('#VALUE!');
      return match.index + startNum;
    }

    const idx = withinText.indexOf(findText, startNum - 1);
    return idx === -1 ? err('#VALUE!') : idx + 1;
  },

  REPLACE: (args) => {
    if (args.length < 4) return err('#VALUE!');
    const text = String(args[0] ?? '');
    const start = toNumber(args[1] ?? 0);
    const numChars = toNumber(args[2] ?? 0);
    const newText = String(args[3] ?? '');
    if (start === null || numChars === null || start < 1) return err('#VALUE!');
    return text.slice(0, start - 1) + newText + text.slice(start - 1 + numChars);
  },

  REPT: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const text = String(args[0] ?? '');
    const times = toNumber(args[1] ?? 0);
    if (times === null || times < 0) return err('#VALUE!');
    return text.repeat(Math.floor(times));
  },

  TEXT: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const val = toNumber(args[0] ?? 0);
    const fmt = String(args[1] ?? '');
    if (val === null) return String(args[0] ?? '');

    // Basic format patterns
    if (fmt === '0') return Math.round(val).toString();
    if (fmt.startsWith('0.')) {
      const decimals = fmt.length - 2;
      return val.toFixed(decimals);
    }
    if (fmt === '#,##0') return Math.round(val).toLocaleString();
    if (fmt.startsWith('#,##0.')) {
      const decimals = fmt.length - 6;
      return val.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }
    if (fmt === '0%') return Math.round(val * 100) + '%';
    if (fmt === '0.00%') return (val * 100).toFixed(2) + '%';

    return val.toString();
  },

  VALUE: (args) => {
    if (args.length < 1) return err('#VALUE!');
    const v = args[0];
    if (typeof v === 'number') return v;
    const n = Number(String(v).replace(/[,$]/g, ''));
    return isNaN(n) ? err('#VALUE!') : n;
  },

  EXACT: (args) => {
    if (args.length < 2) return err('#VALUE!');
    return String(args[0] ?? '') === String(args[1] ?? '');
  },

  T: (args) => {
    if (args.length < 1) return '';
    return typeof args[0] === 'string' ? args[0] : '';
  },

  CHAR: (args) => {
    const n = toNumber(args[0] ?? 0);
    if (n === null || n < 1 || n > 65535) return err('#VALUE!');
    return String.fromCharCode(n);
  },

  CODE: (args) => {
    const text = String(args[0] ?? '');
    if (text.length === 0) return err('#VALUE!');
    return text.charCodeAt(0);
  },

  TEXTJOIN: (args) => {
    if (args.length < 3) return err('#VALUE!');
    const delimiter = String(args[0] ?? '');
    const ignoreEmpty = args[1] === true || args[1] === 1;
    const values = flattenAll(args.slice(2));
    const parts = values
      .map((v) => isError(v) ? '' : String(v === true ? 'TRUE' : v === false ? 'FALSE' : v))
      .filter((v) => !ignoreEmpty || v !== '');
    return parts.join(delimiter);
  },

  NUMBERVALUE: (args) => {
    if (args.length < 1) return err('#VALUE!');
    const text = String(args[0] ?? '').trim();
    const decSep = String(args[1] ?? '.');
    const grpSep = String(args[2] ?? ',');
    const cleaned = text.replace(new RegExp(`\\${grpSep}`, 'g'), '').replace(decSep, '.');
    const n = Number(cleaned);
    return isNaN(n) ? err('#VALUE!') : n;
  },
};
