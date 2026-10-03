import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createHistoryService, type HistoryState } from '../services/historyService';
import { debounce } from '../../../core/utils/debounce';
import { HISTORY_DEBOUNCE_MS } from '../../editor/constants/editorConstants';
import type { EditorHistoryApi, EditorService, UseHistoryHook } from '../../editor/types/editor.types';

/**
 * Wires a history service to an editor's setHtml/getHtml, exposing
 * undo/redo actions and canUndo/canRedo flags for the toolbar.
 *
 * Conforms to `UseHistoryHook` from `features/editor/types/editor.types`,
 * so it can be passed as `useEditor`'s second argument in place of the
 * foundational layer's inline placeholder.
 */
export const useHistory: UseHistoryHook = (editorService: EditorService, initialHtml: string): EditorHistoryApi => {
  // Created once via a lazy state initializer (not a ref) so the instance
  // stays stable across renders — see `useEditor.ts` for the same pattern
  // applied to `editorService`/`selectionService`.
  const [historyService] = useState(() => createHistoryService(initialHtml));
  const [state, setState] = useState<HistoryState>(() => historyService.getState());
  const suppressRef = useRef(false);

  useEffect(() => historyService.subscribe(setState), [historyService]);

  const pushDebounced = useMemo(
    () =>
      // The callback below only runs when the debounce timer later fires
      // (an event-handler-like context), never synchronously during this
      // render — `debounce` isn't a hook the linter recognizes as deferred,
      // so it conservatively flags the `suppressRef.current` read inside.
      // Confirmed false positive; see `useEditor.ts` for the same pattern.
      // eslint-disable-next-line react-hooks/refs
      debounce((html: string) => {
        if (suppressRef.current) return;
        historyService.push(html);
      }, HISTORY_DEBOUNCE_MS),
    [historyService]
  );

  /** Call after any content-changing mutation (typing, paste, commands). */
  const recordChange = useCallback(
    (immediate = false): void => {
      const html = editorService.getHtml();
      if (immediate) {
        pushDebounced.cancel();
        if (!suppressRef.current) historyService.push(html);
      } else {
        pushDebounced(html);
      }
    },
    [editorService, historyService, pushDebounced]
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
    pushDebounced.flush();
    const html = historyService.undo();
    if (html != null) applyWithoutRecording(html);
  }, [applyWithoutRecording, historyService, pushDebounced]);

  const redo = useCallback((): void => {
    const html = historyService.redo();
    if (html != null) applyWithoutRecording(html);
  }, [applyWithoutRecording, historyService]);

  const reset = useCallback(
    (html: string): void => {
      historyService.reset(html);
    },
    [historyService]
  );

  return { canUndo: state.canUndo, canRedo: state.canRedo, recordChange, undo, redo, reset };
};
