import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  children: ReactNode;
  variant?: ButtonVariant;
}

/**
 * Generic labeled button used in dialogs and menus (not the toolbar,
 * which uses IconButton). Supports primary/secondary/danger variants.
 */
export function Button({ children, variant = 'secondary', type = 'button', disabled, ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      className={`nova-wordpad-btn nova-wordpad-btn--${variant}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
