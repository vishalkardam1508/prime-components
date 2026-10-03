import { parseFormula } from './parser';
import { evaluate, isError, toDisplay, setParserRef } from './evaluator';
import { registry } from './registry';

// Wire parser into evaluator to break circular dependency
setParserRef(parseFormula);

export { parseFormula, evaluate, isError, toDisplay, registry };
export type { FormulaContext, FormulaValue, SheetData } from './types';
