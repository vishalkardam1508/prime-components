import type { FormulaFunction, FormulaValue } from '../types';
import { err, flattenToNumbers, flattenAll, isError, toNumber } from '../evaluator';
import { matchesCriteria } from './math';

export const statsFunctions: Record<string, FormulaFunction> = {
  AVERAGE: (args) => {
    const nums = flattenToNumbers(args);
    if (nums.length === 0) return err('#DIV/0!');
    return nums.reduce((s, n) => s + n, 0) / nums.length;
  },

  AVERAGEIF: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const range = Array.isArray(args[0]) ? args[0] : [args[0]];
    const criteria = args[1];
    const avgRange = args.length >= 3 && Array.isArray(args[2]) ? args[2] : range;
    let sum = 0;
    let count = 0;
    for (let i = 0; i < range.length; i++) {
      if (matchesCriteria(range[i], criteria)) {
        const v = toNumber(avgRange[i] ?? 0);
        if (v !== null) { sum += v; count++; }
      }
    }
    return count === 0 ? err('#DIV/0!') : sum / count;
  },

  AVERAGEIFS: (args) => {
    if (args.length < 3 || args.length % 2 === 0) return err('#VALUE!');
    const avgRange = Array.isArray(args[0]) ? args[0] : [args[0]];
    let sum = 0;
    let count = 0;
    for (let i = 0; i < avgRange.length; i++) {
      let match = true;
      for (let p = 1; p < args.length; p += 2) {
        const criteriaRange = Array.isArray(args[p]) ? args[p] : [args[p]];
        const criteria = args[p + 1];
        if (!matchesCriteria(criteriaRange[i] ?? '', criteria)) { match = false; break; }
      }
      if (match) {
        const v = toNumber(avgRange[i] ?? 0);
        if (v !== null) { sum += v; count++; }
      }
    }
    return count === 0 ? err('#DIV/0!') : sum / count;
  },

  MIN: (args) => {
    const nums = flattenToNumbers(args);
    if (nums.length === 0) return 0;
    return Math.min(...nums);
  },

  MAX: (args) => {
    const nums = flattenToNumbers(args);
    if (nums.length === 0) return 0;
    return Math.max(...nums);
  },

  COUNT: (args) => {
    const all = flattenAll(args);
    return all.filter((v) => typeof v === 'number' || (typeof v === 'string' && v !== '' && !isNaN(Number(v)))).length;
  },

  COUNTA: (args) => {
    const all = flattenAll(args);
    return all.filter((v) => v !== '' && v !== 0 && v !== null && v !== undefined).length;
  },

  COUNTBLANK: (args) => {
    const all = flattenAll(args);
    return all.filter((v) => v === '' || v === 0 || v === null || v === undefined).length;
  },

  COUNTIF: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const range = Array.isArray(args[0]) ? args[0] : [args[0]];
    const criteria = args[1];
    let count = 0;
    for (const cell of range) {
      if (matchesCriteria(cell, criteria)) count++;
    }
    return count;
  },

  COUNTIFS: (args) => {
    if (args.length < 2 || args.length % 2 !== 0) return err('#VALUE!');
    const firstRange = Array.isArray(args[0]) ? args[0] : [args[0]];
    let count = 0;
    for (let i = 0; i < firstRange.length; i++) {
      let match = true;
      for (let p = 0; p < args.length; p += 2) {
        const range = Array.isArray(args[p]) ? args[p] : [args[p]];
        const criteria = args[p + 1];
        if (!matchesCriteria(range[i] ?? '', criteria)) { match = false; break; }
      }
      if (match) count++;
    }
    return count;
  },

  MEDIAN: (args) => {
    const nums = flattenToNumbers(args).sort((a, b) => a - b);
    if (nums.length === 0) return err('#NUM!');
    const mid = Math.floor(nums.length / 2);
    return nums.length % 2 === 0 ? (nums[mid - 1] + nums[mid]) / 2 : nums[mid];
  },

  STDEV: (args) => {
    const nums = flattenToNumbers(args);
    if (nums.length < 2) return err('#DIV/0!');
    const mean = nums.reduce((s, n) => s + n, 0) / nums.length;
    const variance = nums.reduce((s, n) => s + (n - mean) ** 2, 0) / (nums.length - 1);
    return Math.sqrt(variance);
  },

  'STDEV.S': (args) => statsFunctions.STDEV(args, {} as never),

  'STDEV.P': (args) => {
    const nums = flattenToNumbers(args);
    if (nums.length === 0) return err('#DIV/0!');
    const mean = nums.reduce((s, n) => s + n, 0) / nums.length;
    const variance = nums.reduce((s, n) => s + (n - mean) ** 2, 0) / nums.length;
    return Math.sqrt(variance);
  },

  VAR: (args) => {
    const nums = flattenToNumbers(args);
    if (nums.length < 2) return err('#DIV/0!');
    const mean = nums.reduce((s, n) => s + n, 0) / nums.length;
    return nums.reduce((s, n) => s + (n - mean) ** 2, 0) / (nums.length - 1);
  },

  'VAR.S': (args) => statsFunctions.VAR(args, {} as never),

  'VAR.P': (args) => {
    const nums = flattenToNumbers(args);
    if (nums.length === 0) return err('#DIV/0!');
    const mean = nums.reduce((s, n) => s + n, 0) / nums.length;
    return nums.reduce((s, n) => s + (n - mean) ** 2, 0) / nums.length;
  },

  LARGE: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const nums = flattenToNumbers([args[0]]).sort((a, b) => b - a);
    const k = toNumber(args[1] ?? 0);
    if (k === null || k < 1 || k > nums.length) return err('#NUM!');
    return nums[k - 1];
  },

  SMALL: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const nums = flattenToNumbers([args[0]]).sort((a, b) => a - b);
    const k = toNumber(args[1] ?? 0);
    if (k === null || k < 1 || k > nums.length) return err('#NUM!');
    return nums[k - 1];
  },

  MODE: (args) => {
    const nums = flattenToNumbers(args);
    if (nums.length === 0) return err('#N/A');
    const freq: Record<number, number> = {};
    for (const n of nums) freq[n] = (freq[n] ?? 0) + 1;
    let maxFreq = 0;
    let mode = nums[0];
    for (const [val, count] of Object.entries(freq)) {
      if (count > maxFreq) { maxFreq = count; mode = Number(val); }
    }
    if (maxFreq <= 1) return err('#N/A');
    return mode;
  },

  PERCENTILE: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const nums = flattenToNumbers([args[0]]).sort((a, b) => a - b);
    const k = toNumber(args[1] ?? 0);
    if (k === null || k < 0 || k > 1 || nums.length === 0) return err('#NUM!');
    const idx = k * (nums.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.ceil(idx);
    if (lo === hi) return nums[lo];
    return nums[lo] + (nums[hi] - nums[lo]) * (idx - lo);
  },
};
