import { useEffect, useMemo, useRef } from 'react';
import type { RefObject, ClipboardEvent, DragEvent, KeyboardEvent } from 'react';
import { getAllCommands } from '../../../core/commands/commandRegistry';
import { sanitizeHtml } from '../utils/sanitizeHtml';
import { debounce } from '../../../core/utils/debounce';

const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

function eventToShortcut(e: KeyboardEvent<HTMLElement>): string {
  const parts: string[] = [];
  if (isMac ? e.metaKey : e.ctrlKey) parts.push('Ctrl');
  if (e.shiftKey) parts.push('Shift');
  if (e.altKey) parts.push('Alt');
  const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
  parts.push(key);
  return parts.join('+');
}

/**
 * Reserved shortcuts the host app handles itself (undo/redo/find/save/...)
 * rather than routing through the command registry.
 */
const RESERVED_SHORTCUTS: Record<string, string> = {
  'Ctrl+Z': 'undo',
  'Ctrl+Y': 'redo',
  'Ctrl+Shift+Z': 'redo',
  'Ctrl+A': 'selectAll',
  'Ctrl+S': 'save',
  'Ctrl+F': 'find',
  'Ctrl+H': 'replace'
};

export interface UseEditorEventsOptions {
  onShortcut?: (commandId: string) => void;
  onChange?: (immediate?: boolean) => void;
  onImportFiles?: (files: File[]) => void;
  onReserved?: (action: string) => void;
}

export interface UseEditorEventsResult {
  handleKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
  handlePaste: (e: ClipboardEvent<HTMLDivElement>) => void;
  handleDrop: (e: DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: DragEvent<HTMLDivElement>) => void;
  handleInput: () => void;
}

/**
 * Attaches all editor-level DOM event handling: keyboard shortcuts routed
 * through the command registry, clipboard sanitization on paste, file
 * drag/drop delegated to the import pipeline, and a MutationObserver
 * that reports content changes regardless of source.
 */
export function useEditorEvents(
  rootRef: RefObject<HTMLElement | null>,
  { onShortcut, onChange, onImportFiles, onReserved }: UseEditorEventsOptions
): UseEditorEventsResult {
  const debouncedChange = useMemo(() => debounce(() => onChange?.(), 400), [onChange]);
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const observer = new MutationObserver(() => debouncedChange());
    observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true });
    observerRef.current = observer;

    return (): void => observer.disconnect();
  }, [rootRef, debouncedChange]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    const shortcut = eventToShortcut(e);

    const reserved = RESERVED_SHORTCUTS[shortcut];
    if (reserved != null) {
      e.preventDefault();
      onReserved?.(reserved);
      return;
    }

    const command = getAllCommands().find((c) => c.shortcut === shortcut);
    if (command) {
      e.preventDefault();
      onShortcut?.(command.id);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const root = rootRef.current;
    if (!root) return;

    const html = e.clipboardData.getData('text/html');
    const text = e.clipboardData.getData('text/plain');

    if (html) {
      const clean = sanitizeHtml(html);
      document.execCommand('insertHTML', false, clean);
    } else if (text) {
      document.execCommand(
        'insertHTML',
        false,
        text
          .split(/\r?\n/)
          .map((line) => `<p>${escapeForInsert(line)}</p>`)
          .join('')
      );
    }
    debouncedChange.flush();
    onChange?.(true);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    const files = Array.from(e.dataTransfer?.files ?? []);
    if (files.length > 0) {
      e.preventDefault();
      onImportFiles?.(files);
    }
    // Plain text/URI drops fall through to native contenteditable behavior.
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    if (e.dataTransfer?.types?.includes('Files')) {
      e.preventDefault();
    }
  };

  const handleInput = (): void => {
    debouncedChange();
  };

  return { handleKeyDown, handlePaste, handleDrop, handleDragOver, handleInput };
}

function escapeForInsert(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
