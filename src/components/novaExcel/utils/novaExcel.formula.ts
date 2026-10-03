import type { CellsMap } from '../types/novaExcel.types';
import { parseFormula, evaluate, toDisplay } from './formula';
import type { FormulaContext, SheetData } from './formula';

export interface FormulaSheetInput {
  name: string;
  cells: CellsMap;
}

/** Recompute all formula cells across all sheets, return computed values for active sheet */
export function recomputeAllFormulas(
  cells: CellsMap,
  allSheets?: FormulaSheetInput[],
  activeSheetIndex?: number,
): Record<string, string | number> {
  const sheets: SheetData[] = allSheets != null && allSheets.length > 0
    ? allSheets
    : [{ name: 'Sheet 1', cells }];

  const activeIdx = activeSheetIndex ?? 0;
  const activeCells = sheets[activeIdx]?.cells ?? cells;

  const computed: Record<string, string | number> = {};

  for (const [k, raw] of Object.entries(activeCells)) {
    if (typeof raw === 'string' && raw.startsWith('=')) {
      try {
        const ast = parseFormula(raw);
        const ctx: FormulaContext = {
          sheets,
          activeSheetIndex: activeIdx,
          visited: new Set([`${sheets[activeIdx]?.name ?? ''}!${k}`]),
          depth: 0,
        };
        const result = evaluate(ast, ctx);
        computed[k] = toDisplay(result);
      } catch {
        computed[k] = '#ERR!';
      }
    } else {
      computed[k] = raw;
    }
  }

  return computed;
}
