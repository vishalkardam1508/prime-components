import type { MouseEvent, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children?: ReactNode;
}

/**
 * Bare backdrop + centering primitive. Dialog builds accessible dialog
 * semantics (focus trap, Escape, labeling) on top of this.
 */
export function Modal({ open, onClose, children }: ModalProps) {
  if (!open) return null;

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return createPortal(
    // `nova-wordpad-root` re-establishes the theme's CSS custom properties on this
    // subtree: the modal is portaled to `document.body`, outside the DOM subtree
    // of whatever `.nova-wordpad-root`-scoped element rendered it, so without this
    // class every `var(--bg-paper)`/`var(--text-primary)`/etc. reference here would
    // resolve to nothing (the dialog rendering fully unstyled/transparent).
    <div className="nova-wordpad-root nova-wordpad-modal-backdrop" onMouseDown={handleMouseDown}>
      {children}
    </div>,
    document.body
  );
}
