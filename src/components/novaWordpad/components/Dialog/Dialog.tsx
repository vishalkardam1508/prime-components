import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Modal } from '../Modal/Modal';
import './Dialog.css';

export interface DialogProps {
  open: boolean;
  title: string;
  onClose?: () => void;
  children?: ReactNode;
  footer?: ReactNode;
  width?: number;
}

/**
 * Accessible dialog: traps focus, closes on Escape, restores focus to the
 * triggering control on close. Feature dialogs (Link, Image, Table,
 * Find/Replace) build their form content as children.
 */
export function Dialog({ open, title, onClose, children, footer, width = 420 }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Keep the latest onClose in a ref so the keydown listener below never needs
  // it as a dependency — calling a stale closure here is harmless (it always
  // reads .current at call time), whereas depending on `onClose` directly
  // would force this effect to tear down/rebuild on every parent re-render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Grabs initial focus and restores it on close. Deliberately depends ONLY
  // on `open`: this must run exactly once per open/close transition, never
  // on every re-render. The dialog's parent (NovaWordpad) re-renders on
  // nearly every click — via the document-wide `selectionchange` listener —
  // and previously passed a brand-new inline `onClose` function each time.
  // With `onClose` in this effect's deps, that meant this effect re-ran on
  // every such re-render and unconditionally re-focused the *first*
  // focusable field, yanking focus away from whatever the user had actually
  // just clicked into — the dialog was effectively unusable past the first
  // field.
  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const node = dialogRef.current;
    const focusable = node?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();
    return () => {
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  // Escape-to-close and Tab-trapping — safe to re-run per render since it
  // only attaches/detaches a listener, never touches focus itself.
  useEffect(() => {
    if (!open) return;
    const node = dialogRef.current;

    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
        return;
      }
      if (e.key === 'Tab') {
        const focusable = node?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable == null || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    node?.addEventListener('keydown', onKeyDown);
    return () => node?.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <div
        className="nova-wordpad-dialog"
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="nova-wordpad-dialog-title"
        ref={dialogRef}
      >
        <div className="nova-wordpad-dialog__header">
          <h2 className="nova-wordpad-dialog__title" id="nova-wordpad-dialog-title">
            {title}
          </h2>
          <button className="nova-wordpad-dialog__close" aria-label="Close dialog" onClick={onClose} type="button">
            ✕
          </button>
        </div>
        <div className="nova-wordpad-dialog__body">{children}</div>
        {footer != null && <div className="nova-wordpad-dialog__footer">{footer}</div>}
      </div>
    </Modal>
  );
}
