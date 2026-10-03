import type { MouseEventHandler, ReactNode } from 'react';
import './IconButton.css';

export interface IconButtonProps {
  label: string;
  shortcut?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  children: ReactNode;
}

/**
 * Small square toolbar button. Always requires an aria-label and title
 * so every action stays keyboard/screen-reader accessible.
 */
export function IconButton({ label, shortcut, active = false, disabled, onClick, children }: IconButtonProps) {
  const title = shortcut != null && shortcut !== '' ? `${label} (${shortcut})` : label;
  return (
    <button
      type="button"
      className={`nova-wordpad-icon-btn${active ? ' nova-wordpad-icon-btn--active' : ''}`}
      aria-label={label}
      aria-pressed={active ? 'true' : 'false'}
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep editor selection intact
      onClick={onClick}
    >
      {children}
    </button>
  );
}
