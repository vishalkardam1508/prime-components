import { HISTORY_MAX_STATES } from '../../editor/constants/editorConstants';

export interface HistoryState {
  canUndo: boolean;
  canRedo: boolean;
  current: string;
}

export type HistoryListener = (state: HistoryState) => void;

/** Subscribable linear undo/redo stack of HTML snapshots. */
export interface HistoryService {
  push: (html: string) => void;
  undo: () => string | null;
  redo: () => string | null;
  reset: (html: string) => void;
  getState: () => HistoryState;
  subscribe: (fn: HistoryListener) => () => void;
}

/**
 * Simple linear undo/redo stack of HTML snapshots. Pushing while not at
 * the tip discards the redo branch (standard editor semantics).
 */
export function createHistoryService(initialHtml: string, maxStates: number = HISTORY_MAX_STATES): HistoryService {
  let stack: string[] = [initialHtml];
  let index = 0;

  const listeners = new Set<HistoryListener>();
  const notify = (): void => listeners.forEach((fn) => fn(getState()));

  function getState(): HistoryState {
    return {
      canUndo: index > 0,
      canRedo: index < stack.length - 1,
      current: stack[index]
    };
  }

  return {
    push(html: string): void {
      if (html === stack[index]) return;
      stack = stack.slice(0, index + 1);
      stack.push(html);
      if (stack.length > maxStates) {
        stack.shift();
      } else {
        index += 1;
      }
      index = stack.length - 1;
      notify();
    },

    undo(): string | null {
      if (index === 0) return null;
      index -= 1;
      notify();
      return stack[index];
    },

    redo(): string | null {
      if (index >= stack.length - 1) return null;
      index += 1;
      notify();
      return stack[index];
    },

    reset(html: string): void {
      stack = [html];
      index = 0;
      notify();
    },

    getState,
    subscribe(fn: HistoryListener): () => void {
      listeners.add(fn);
      return () => listeners.delete(fn);
    }
  };
}
