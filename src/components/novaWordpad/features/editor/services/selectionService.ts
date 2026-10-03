import { saveSelection } from '../../../core/selection/saveSelection';
import { restoreSelection } from '../../../core/selection/restoreSelection';
import {
  getRangeWithin,
  selectAll as selectAllIn,
  collapseToEnd as collapseToEndIn,
  getBlockAncestor,
  hasSelection as hasSelectionIn,
  insertNodeAtCaret as insertNodeAtCaretIn
} from '../../../core/selection/selectionUtils';
import type { SelectionService } from '../types/editor.types';

/**
 * Creates a selection API bound to a specific editor root element.
 * This is what feature commands and dialogs interact with — never
 * the raw window.getSelection() directly.
 */
export function createSelectionService(getRoot: () => HTMLElement | null): SelectionService {
  return {
    save: () => saveSelection(getRoot()),
    restore: (snapshot) => restoreSelection(getRoot(), snapshot),
    getRange: () => getRangeWithin(getRoot()),
    selectAll: () => selectAllIn(getRoot()),
    collapseToEnd: () => collapseToEndIn(getRoot()),
    getBlockAncestor: () => getBlockAncestor(getRoot()),
    hasSelection: () => hasSelectionIn(getRoot()),
    insertNodeAtCaret: (node) => insertNodeAtCaretIn(getRoot(), node)
  };
}
