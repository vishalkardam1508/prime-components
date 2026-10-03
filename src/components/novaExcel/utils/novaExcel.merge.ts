import type { SelectionRange } from '../types/novaExcel.types';

/** Find the merge (if any) that contains cell (r, c) */
export function findMergeAt(merges: SelectionRange[], r: number, c: number): SelectionRange | null {
  for (const m of merges) {
    if (r >= m.r1 && r <= m.r2 && c >= m.c1 && c <= m.c2) return m;
  }
  return null;
}

/** Whether two rectangular ranges overlap at all */
export function rangesOverlap(a: SelectionRange, b: SelectionRange): boolean {
  return a.r1 <= b.r2 && a.r2 >= b.r1 && a.c1 <= b.c2 && a.c2 >= b.c1;
}

/**
 * Re-map merges after a row is inserted at `idx`, mirroring the same
 * shift rule used for cell keys. `inclusive: true` = rows >= idx shift
 * ("insert above" semantics), `false` = rows > idx shift ("insert below").
 * A merge straddling the insertion point grows by one row instead of moving.
 */
export function insertRowIntoMerges(merges: SelectionRange[], idx: number, inclusive: boolean): SelectionRange[] {
  return merges.map((m) => {
    const startShifts = inclusive ? m.r1 >= idx : m.r1 > idx;
    if (startShifts) return { ...m, r1: m.r1 + 1, r2: m.r2 + 1 };
    const endShifts = inclusive ? m.r2 >= idx : m.r2 > idx;
    if (endShifts) return { ...m, r2: m.r2 + 1 };
    return m;
  });
}

/** Same as {@link insertRowIntoMerges}, for columns. */
export function insertColIntoMerges(merges: SelectionRange[], idx: number, inclusive: boolean): SelectionRange[] {
  return merges.map((m) => {
    const startShifts = inclusive ? m.c1 >= idx : m.c1 > idx;
    if (startShifts) return { ...m, c1: m.c1 + 1, c2: m.c2 + 1 };
    const endShifts = inclusive ? m.c2 >= idx : m.c2 > idx;
    if (endShifts) return { ...m, c2: m.c2 + 1 };
    return m;
  });
}

/**
 * Re-map merges after row `idx` is deleted: merges entirely after it shift
 * up by one row, merges spanning it shrink by one row (and are dropped if
 * that collapses them), merges entirely before it are untouched.
 */
export function deleteRowFromMerges(merges: SelectionRange[], idx: number): SelectionRange[] {
  const result: SelectionRange[] = [];
  for (const m of merges) {
    if (m.r1 > idx) {
      result.push({ ...m, r1: m.r1 - 1, r2: m.r2 - 1 });
    } else if (m.r2 >= idx) {
      const r2 = m.r2 - 1;
      if (r2 >= m.r1) result.push({ ...m, r2 });
    } else {
      result.push(m);
    }
  }
  return result;
}

/** Same as {@link deleteRowFromMerges}, for columns. */
export function deleteColFromMerges(merges: SelectionRange[], idx: number): SelectionRange[] {
  const result: SelectionRange[] = [];
  for (const m of merges) {
    if (m.c1 > idx) {
      result.push({ ...m, c1: m.c1 - 1, c2: m.c2 - 1 });
    } else if (m.c2 >= idx) {
      const c2 = m.c2 - 1;
      if (c2 >= m.c1) result.push({ ...m, c2 });
    } else {
      result.push(m);
    }
  }
  return result;
}
