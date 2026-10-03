import type { RefObject } from 'react';
import type { SelectionSnapshot } from '../../../core/selection/saveSelection';

/**
 * The single place that touches editor DOM content directly. Bound to a
 * specific contenteditable root element via a `getRoot` accessor.
 */
export interface EditorService {
  getRoot: () => HTMLElement | null;
  focus: () => void;
  getHtml: () => string;
  setHtml: (html: string) => void;
  normalize: () => void;
  isEmpty: () => boolean;
  /**
   * Executes a legacy execCommand and immediately normalizes the result.
   * Only used for a small set of well-behaved inline commands; block
   * structure commands go through custom DOM operations instead.
   */
  execLegacy: (command: string, value?: string | null) => void;
}

/**
 * What feature commands and dialogs interact with for selection state —
 * never the raw window.getSelection() directly.
 */
export interface SelectionService {
  save: () => SelectionSnapshot | null;
  restore: (snapshot: SelectionSnapshot | null) => boolean;
  getRange: () => Range | null;
  selectAll: () => void;
  collapseToEnd: () => void;
  getBlockAncestor: () => Element | null;
  hasSelection: () => boolean;
  insertNodeAtCaret: (node: Node) => void;
}

/** Undo/redo surface exposed to the toolbar and to command execution. */
export interface EditorHistoryApi {
  canUndo: boolean;
  canRedo: boolean;
  /** Call after any content-changing mutation (typing, paste, commands). */
  recordChange: (immediate?: boolean) => void;
  undo: () => void;
  redo: () => void;
  reset: (html: string) => void;
}

/**
 * A React-hook-shaped factory for an `EditorHistoryApi`, so `useEditor` can
 * be wired to a real history feature (undo/redo stack, debounced pushes,
 * etc.) without this foundational layer depending on that feature module.
 * Defaults to a minimal in-memory implementation — see `useEditor.ts`.
 */
export type UseHistoryHook = (editorService: EditorService, initialHtml: string) => EditorHistoryApi;

/**
 * The context every registered command's `execute`/`isActive` is called
 * with. This is the canonical `TContext` feature-module command
 * implementations (formatting, paragraph, lists, tables, images, links,
 * ...) should parameterize `CommandDefinition<EditorCommandContext, ...>`
 * with when registering against `core/commands/commandRegistry`.
 */
export interface EditorCommandContext {
  editorService: EditorService;
  selectionService: SelectionService;
  history: EditorHistoryApi;
}

/**
 * The full API returned by `useEditor`, consumed by `<Editor />` and the
 * toolbar layer. `execute`'s payload/result are intentionally `unknown` —
 * they vary per command id, and callers that need per-command type safety
 * should call `core/commands/executeCommand`'s generic `executeCommand`
 * directly with the concrete types for that command.
 */
export interface EditorApi {
  rootRef: RefObject<HTMLDivElement | null>;
  editorService: EditorService;
  selectionService: SelectionService;
  history: EditorHistoryApi;
  execute: (commandId: string, payload?: unknown) => unknown;
  loadDocument: (html: string) => void;
}
