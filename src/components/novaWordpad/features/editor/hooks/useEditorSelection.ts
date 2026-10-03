import { useEffect, useState, useCallback } from 'react';
import type { RefObject } from 'react';

export interface UseEditorSelectionResult {
  version: number;
  bump: () => void;
}

/**
 * Bumps a version counter whenever the selection changes while it's
 * inside the editor root, or on input. Toolbar components re-derive
 * their active/current-value state from this without owning any
 * formatting logic themselves.
 */
export function useEditorSelection(rootRef: RefObject<HTMLElement | null>): UseEditorSelectionResult {
  const [version, setVersion] = useState(0);
  const bump = useCallback((): void => setVersion((v) => v + 1), []);

  useEffect(() => {
    const onSelectionChange = (): void => {
      const root = rootRef.current;
      const selection = window.getSelection();
      if (!root || !selection || selection.rangeCount === 0) return;
      if (root.contains(selection.getRangeAt(0).commonAncestorContainer)) {
        bump();
      }
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return (): void => document.removeEventListener('selectionchange', onSelectionChange);
  }, [rootRef, bump]);

  return { version, bump };
}
