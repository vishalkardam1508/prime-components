import { useState } from 'react';
import { IconButton } from '../../../components/IconButton/IconButton';
import { ColorPicker } from '../../../components/ColorPicker/ColorPicker';

const HIGHLIGHT_SWATCHES = [
  '#fdf3d8', '#fde68a', '#fca5a5', '#bbf7d0', '#bfdbfe', '#e9d5ff',
  '#fbcfe8', '#fed7aa', '#a7f3d0', '#c7d2fe', '#fecaca', '#ffffff'
];

export interface HighlightPickerProps {
  onSelect: (color: string) => void;
  currentColor?: string;
}

export function HighlightPicker({ onSelect, currentColor = '#fdf3d8' }: HighlightPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <IconButton label="Highlight" onClick={() => setOpen((v) => !v)}>
        <svg viewBox="0 0 16 16" fill="none">
          <path d="M10 1 3 8l1.5 4L9 10.5 15 4.5 10 1Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <rect x="2" y="13" width="10" height="2" fill={currentColor} />
        </svg>
      </IconButton>
      {open && (
        <ColorPicker
          label="Highlight"
          value={currentColor}
          swatches={HIGHLIGHT_SWATCHES}
          onSelect={(color) => {
            onSelect(color);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
