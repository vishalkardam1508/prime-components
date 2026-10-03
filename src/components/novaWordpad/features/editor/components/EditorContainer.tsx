import type { ReactNode } from 'react';
import './EditorContainer.css';

export interface EditorContainerProps {
  zoom: number;
  children?: ReactNode;
}

export function EditorContainer({ zoom, children }: EditorContainerProps) {
  return (
    <div className="nova-wordpad-editor-container">
      <div className="nova-wordpad-editor-page" style={{ transform: `scale(${zoom / 100})` }}>
        {children}
      </div>
    </div>
  );
}
