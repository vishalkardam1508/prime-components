import { useCallback, useRef, useState } from 'react';
import { createEditorService } from '../services/editorService';
import { createSelectionService } from '../services/selectionService';
import { executeCommand as runCommand } from '../../../core/commands/executeCommand';
import { DEFAULT_DOCUMENT_HTML, HISTORY_MAX_STATES } from '../constants/editorConstants';
import type { EditorApi, EditorCommandContext, EditorHistoryApi, EditorService, UseHistoryHook } from '../types/editor.types';

/**
 * Minimal in-memory undo/redo stack of HTML snapshots, used as `useEditor`'s
 * default history implementation. The dedicated `history` feature module
 * (debounced pushes, a subscribable service, etc.) is out of scope for this
 * foundational layer — when it lands, wire it in by passing its hook as
 * `useEditor`'s second argument instead of relying on this default.
 *
 * `stack`/`index` are kept as React state (not refs) so `canUndo`/`canRedo`
 * can be read directly during render — reading a ref's `.current` during
 * render is a react-hooks lint violation (and unsound under concurrent
 * rendering), so it's avoided here entirely.
 */
function useInlineHistory(editorService: EditorService, initialHtml: string): EditorHistoryApi {
  const [stack, setStack] = useState<string[]>([initialHtml]);
  const [index, setIndex] = useState(0);
  const suppressRef = useRef(false);

  const recordChange = useCallback(
    (_immediate = false): void => {
      if (suppressRef.current) return;
      const html = editorService.getHtml();
      if (html === stack[index]) return;
      const truncated = stack.slice(0, index + 1);
      truncated.push(html);
      const nextStack = truncated.length > HISTORY_MAX_STATES ? truncated.slice(1) : truncated;
      setStack(nextStack);
      setIndex(nextStack.length - 1);
    },
    [editorService, stack, index]
  );

  const applyWithoutRecording = useCallback(
    (html: string): void => {
      suppressRef.current = true;
      editorService.setHtml(html);
      suppressRef.current = false;
    },
    [editorService]
  );

  const undo = useCallback((): void => {
    if (index === 0) return;
    const nextIndex = index - 1;
    applyWithoutRecording(stack[nextIndex]);
    setIndex(nextIndex);
  }, [applyWithoutRecording, stack, index]);

  const redo = useCallback((): void => {
    if (index >= stack.length - 1) return;
    const nextIndex = index + 1;
    applyWithoutRecording(stack[nextIndex]);
    setIndex(nextIndex);
  }, [applyWithoutRecording, stack, index]);

  const reset = useCallback((html: string): void => {
    setStack([html]);
    setIndex(0);
  }, []);

  return {
    canUndo: index > 0,
    canRedo: index < stack.length - 1,
    recordChange,
    undo,
    redo,
    reset
  };
}

/**
 * Creates the editor's service layer and exposes a single `execute(id,
 * payload)` entry point. Toolbar/keyboard code never touches the DOM or
 * formatting logic directly — everything routes through here, matching
 * the React UI -> Command -> Selection -> DOM -> History pipeline.
 */
export function useEditor(
  initialHtml: string = DEFAULT_DOCUMENT_HTML,
  useHistoryHook: UseHistoryHook = useInlineHistory
): EditorApi {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const getRoot = useCallback((): HTMLElement | null => rootRef.current, []);

  // Instantiated once via a lazy state initializer (not a ref) so the
  // instance stays stable across renders. `createEditorService`/
  // `createSelectionService` only *store* `getRoot` for their methods to
  // call later (on focus/getHtml/etc., always outside render) — they never
  // invoke it eagerly here — but the react-hooks/refs rule can't see that
  // deep and conservatively flags any ref-reading function reaching a
  // render-time call. Confirmed false positive; see core services' source.
  // eslint-disable-next-line react-hooks/refs
  const [editorService] = useState<EditorService>(() => createEditorService(getRoot));
  // eslint-disable-next-line react-hooks/refs
  const [selectionService] = useState(() => createSelectionService(getRoot));

  const history = useHistoryHook(editorService, initialHtml);

  const execute = useCallback(
    (commandId: string, payload?: unknown): unknown => {
      const savedSelection = selectionService.save();
      const context: EditorCommandContext = { editorService, selectionService, history };
      const result = runCommand<EditorCommandContext, unknown, unknown>(commandId, context, payload);
      if (!selectionService.getRange() && savedSelection) {
        selectionService.restore(savedSelection);
      }
      history.recordChange(true);
      return result;
    },
    [editorService, selectionService, history]
  );

  const loadDocument = useCallback(
    (html: string): void => {
      editorService.setHtml(html);
      history.reset(editorService.getHtml());
    },
    [editorService, history]
  );

  return {
    rootRef,
    editorService,
    selectionService,
    history,
    execute,
    loadDocument
  };
}
