import { useState } from 'react';
import { IconButton } from '../../../components/IconButton/IconButton';
import { ColorPicker } from '../../../components/ColorPicker/ColorPicker';

export interface TextColorPickerProps {
  onSelect: (color: string) => void;
  currentColor?: string;
}

export function TextColorPicker({ onSelect, currentColor = '#000000' }: TextColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <IconButton label="Text Color" onClick={() => setOpen((v) => !v)}>
        <svg viewBox="0 0 16 16" fill="none">
          <path d="M6.5 1.5 2.5 12h1.6l.9-2.5h3.6l.9 2.5h1.6L7.1 1.5H6.5Zm-.9 6.6 1.2-3.4 1.2 3.4H5.6Z" fill="currentColor" />
          <rect x="2" y="13" width="10" height="2" fill={currentColor} />
        </svg>
      </IconButton>
      {open && (
        <ColorPicker
          label="Text Color"
          value={currentColor}
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
