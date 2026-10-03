import type { FormulaFunction } from '../types';
import { err, toNumber } from '../evaluator';

// Excel serial date epoch: Jan 0, 1900 (day 1 = Jan 1, 1900)
const EXCEL_EPOCH = new Date(1899, 11, 30).getTime(); // Dec 30, 1899
const MS_PER_DAY = 86400000;

function dateToSerial(d: Date): number {
  return Math.floor((d.getTime() - EXCEL_EPOCH) / MS_PER_DAY);
}

function serialToDate(serial: number): Date {
  return new Date(EXCEL_EPOCH + serial * MS_PER_DAY);
}

function toDateSerial(v: unknown): number | null {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const d = new Date(v);
    if (!isNaN(d.getTime())) return dateToSerial(d);
    const n = Number(v);
    if (!isNaN(n)) return n;
  }
  return null;
}

export const dateFunctions: Record<string, FormulaFunction> = {
  TODAY: () => dateToSerial(new Date()),

  NOW: () => {
    const now = new Date();
    return dateToSerial(now) + (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()) / 86400;
  },

  DATE: (args) => {
    const y = toNumber(args[0] ?? 0);
    const m = toNumber(args[1] ?? 0);
    const d = toNumber(args[2] ?? 0);
    if (y === null || m === null || d === null) return err('#VALUE!');
    const date = new Date(y < 100 ? y + 1900 : y, m - 1, d);
    return dateToSerial(date);
  },

  DATEVALUE: (args) => {
    const text = String(args[0] ?? '');
    const d = new Date(text);
    if (isNaN(d.getTime())) return err('#VALUE!');
    return dateToSerial(d);
  },

  YEAR: (args) => {
    const serial = toDateSerial(args[0]);
    if (serial === null) return err('#VALUE!');
    return serialToDate(serial).getFullYear();
  },

  MONTH: (args) => {
    const serial = toDateSerial(args[0]);
    if (serial === null) return err('#VALUE!');
    return serialToDate(serial).getMonth() + 1;
  },

  DAY: (args) => {
    const serial = toDateSerial(args[0]);
    if (serial === null) return err('#VALUE!');
    return serialToDate(serial).getDate();
  },

  HOUR: (args) => {
    const serial = toNumber(args[0] ?? 0);
    if (serial === null) return err('#VALUE!');
    const frac = serial - Math.floor(serial);
    return Math.floor(frac * 24);
  },

  MINUTE: (args) => {
    const serial = toNumber(args[0] ?? 0);
    if (serial === null) return err('#VALUE!');
    const frac = serial - Math.floor(serial);
    return Math.floor((frac * 24 - Math.floor(frac * 24)) * 60);
  },

  SECOND: (args) => {
    const serial = toNumber(args[0] ?? 0);
    if (serial === null) return err('#VALUE!');
    const frac = serial - Math.floor(serial);
    const totalSec = frac * 86400;
    return Math.floor(totalSec % 60);
  },

  DATEDIF: (args) => {
    if (args.length < 3) return err('#VALUE!');
    const startSerial = toDateSerial(args[0]);
    const endSerial = toDateSerial(args[1]);
    const unit = String(args[2] ?? '').toUpperCase();
    if (startSerial === null || endSerial === null) return err('#VALUE!');
    if (startSerial > endSerial) return err('#NUM!');

    const startDate = serialToDate(startSerial);
    const endDate = serialToDate(endSerial);

    switch (unit) {
      case 'Y': return endDate.getFullYear() - startDate.getFullYear() -
        (endDate.getMonth() < startDate.getMonth() || (endDate.getMonth() === startDate.getMonth() && endDate.getDate() < startDate.getDate()) ? 1 : 0);
      case 'M': {
        let months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
        if (endDate.getDate() < startDate.getDate()) months--;
        return months;
      }
      case 'D': return endSerial - startSerial;
      case 'YM': {
        let m = endDate.getMonth() - startDate.getMonth();
        if (m < 0) m += 12;
        if (endDate.getDate() < startDate.getDate()) m--;
        return m < 0 ? m + 12 : m;
      }
      case 'YD': {
        const tempDate = new Date(startDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        let diff = Math.floor((tempDate.getTime() - startDate.getTime()) / MS_PER_DAY);
        if (diff < 0) diff += 365;
        return diff;
      }
      case 'MD': {
        let d = endDate.getDate() - startDate.getDate();
        if (d < 0) {
          const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
          d += prevMonth.getDate();
        }
        return d;
      }
      default: return err('#VALUE!');
    }
  },

  EDATE: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const serial = toDateSerial(args[0]);
    const months = toNumber(args[1] ?? 0);
    if (serial === null || months === null) return err('#VALUE!');
    const d = serialToDate(serial);
    d.setMonth(d.getMonth() + months);
    return dateToSerial(d);
  },

  EOMONTH: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const serial = toDateSerial(args[0]);
    const months = toNumber(args[1] ?? 0);
    if (serial === null || months === null) return err('#VALUE!');
    const d = serialToDate(serial);
    d.setMonth(d.getMonth() + months + 1, 0); // last day of target month
    return dateToSerial(d);
  },

  WEEKDAY: (args) => {
    if (args.length < 1) return err('#VALUE!');
    const serial = toDateSerial(args[0]);
    const returnType = toNumber(args[1] ?? 1);
    if (serial === null || returnType === null) return err('#VALUE!');
    const d = serialToDate(serial);
    const day = d.getDay(); // 0=Sun, 6=Sat

    switch (returnType) {
      case 1: return day + 1; // 1=Sun, 7=Sat
      case 2: return day === 0 ? 7 : day; // 1=Mon, 7=Sun
      case 3: return day === 0 ? 6 : day - 1; // 0=Mon, 6=Sun
      default: return day + 1;
    }
  },

  NETWORKDAYS: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const startSerial = toDateSerial(args[0]);
    const endSerial = toDateSerial(args[1]);
    if (startSerial === null || endSerial === null) return err('#VALUE!');

    const holidays = new Set<number>();
    if (args.length >= 3 && Array.isArray(args[2])) {
      for (const h of args[2]) {
        const hs = toDateSerial(h);
        if (hs !== null) holidays.add(hs);
      }
    }

    let count = 0;
    const step = startSerial <= endSerial ? 1 : -1;
    for (let d = startSerial; step > 0 ? d <= endSerial : d >= endSerial; d += step) {
      const date = serialToDate(d);
      const dow = date.getDay();
      if (dow !== 0 && dow !== 6 && !holidays.has(d)) count++;
    }
    return count;
  },

  DAYS: (args) => {
    if (args.length < 2) return err('#VALUE!');
    const end = toDateSerial(args[0]);
    const start = toDateSerial(args[1]);
    if (end === null || start === null) return err('#VALUE!');
    return end - start;
  },

  TIME: (args) => {
    const h = toNumber(args[0] ?? 0);
    const m = toNumber(args[1] ?? 0);
    const s = toNumber(args[2] ?? 0);
    if (h === null || m === null || s === null) return err('#VALUE!');
    return (h * 3600 + m * 60 + s) / 86400;
  },
};
