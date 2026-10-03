import type { FunctionRegistry } from '../types';
import { mathFunctions } from './math';
import { statsFunctions } from './stats';
import { logicalFunctions } from './logical';
import { textFunctions } from './text';
import { lookupFunctions } from './lookup';
import { dateFunctions } from './date';
import { infoFunctions } from './info';
import { referenceFunctions } from './reference';

export const allFunctions: FunctionRegistry = {
  ...mathFunctions,
  ...statsFunctions,
  ...logicalFunctions,
  ...textFunctions,
  ...lookupFunctions,
  ...dateFunctions,
  ...infoFunctions,
  ...referenceFunctions,
};
