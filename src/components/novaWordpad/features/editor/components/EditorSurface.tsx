import { forwardRef, useEffect, useRef } from 'react';
import type { ClipboardEventHandler, DragEventHandler, FocusEventHandler, FormEventHandler, KeyboardEventHandler } from 'react';
import './EditorSurface.css';

export interface EditorSurfaceProps {
  initialHtml: string;
  onInput?: FormEventHandler<HTMLDivElement>;
  onPaste?: ClipboardEventHandler<HTMLDivElement>;
  onDrop?: DragEventHandler<HTMLDivElement>;
  onDragOver?: DragEventHandler<HTMLDivElement>;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  onFocus?: FocusEventHandler<HTMLDivElement>;
  onBlur?: FocusEventHandler<HTMLDivElement>;
}

/**
 * Uncontrolled contenteditable surface. Content is seeded imperatively once
 * on mount (never via `dangerouslySetInnerHTML`, which React re-applies on
 * every re-render of this fiber regardless of whether the string value
 * "looks" unchanged — that silently reverted live edits back to
 * `initialHtml` any time an unrelated ancestor state update, e.g. the
 * selection-change/word-count refresh elsewhere in the tree, caused this
 * component to re-render). After mount, only imperative DOM APIs
 * (`editorService.setHtml`, browser formatting commands) ever touch
 * content, which is what actually keeps the caret stable and edits durable.
 */
export const EditorSurface = forwardRef<HTMLDivElement, EditorSurfaceProps>(function EditorSurface(
  { initialHtml, onInput, onPaste, onDrop, onDragOver, onKeyDown, onFocus, onBlur },
  forwardedRef
) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const initializedRef = useRef(false);

  const setRefs = (node: HTMLDivElement | null): void => {
    innerRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    if (innerRef.current) innerRef.current.innerHTML = initialHtml;
    // Intentionally mount-only — the surface is uncontrolled after this point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={setRefs}
      className="nova-wordpad-editor-surface"
      contentEditable
      suppressContentEditableWarning
      spellCheck
      role="textbox"
      aria-multiline="true"
      aria-label="Document content"
      onInput={onInput}
      onPaste={onPaste}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
});
