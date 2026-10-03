import { useEffect } from 'react';
import { EditorContainer } from './EditorContainer';
import { EditorSurface } from './EditorSurface';
import { useEditorEvents } from '../hooks/useEditorEvents';
import type { EditorApi } from '../types/editor.types';

export interface EditorProps {
  editorApi: EditorApi;
  initialHtml: string;
  zoom: number;
  onShortcut?: (commandId: string) => void;
  onChange?: () => void;
  onImportFiles?: (files: File[]) => void;
  onSelectionChange: () => void;
  onReserved?: (action: string) => void;
}

export function Editor({ editorApi, initialHtml, zoom, onShortcut, onChange, onImportFiles, onSelectionChange, onReserved }: EditorProps) {
  const { rootRef } = editorApi;

  const { handleKeyDown, handlePaste, handleDrop, handleDragOver, handleInput } = useEditorEvents(rootRef, {
    onShortcut,
    onChange: (immediate) => {
      editorApi.history.recordChange(immediate);
      onChange?.();
    },
    onImportFiles,
    onReserved
  });

  useEffect(() => {
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, [onSelectionChange]);

  return (
    <EditorContainer zoom={zoom}>
      <EditorSurface
        ref={rootRef}
        initialHtml={initialHtml}
        onInput={handleInput}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onKeyDown={handleKeyDown}
      />
    </EditorContainer>
  );
}
