import type { ReactNode } from 'react';
import './Toolbar.css';

export interface ToolbarProps {
  children?: ReactNode;
}

export function Toolbar({ children }: ToolbarProps) {
  return (
    <div className="nova-wordpad-toolbar" role="toolbar" aria-label="Formatting toolbar">
      {children}
    </div>
  );
}

export interface ToolbarGroupProps {
  children?: ReactNode;
  label?: string;
}

export function ToolbarGroup({ children, label }: ToolbarGroupProps) {
  return (
    <div className="nova-wordpad-toolbar__group" role="group" aria-label={label}>
      {children}
    </div>
  );
}

export function ToolbarDivider() {
  return <span className="nova-wordpad-toolbar__divider" aria-hidden="true" />;
}
