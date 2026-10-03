import { useEffect, useRef, useState } from 'react';
import './ColorPicker.css';

const SWATCHES = [
  '#000000', '#444444', '#666666', '#999999', '#cccccc', '#ffffff',
  '#ac2b1f', '#d97757', '#e8a33d', '#e0c341', '#4c9a5b', '#2c8a7d',
  '#2c4a86', '#4b6fd6', '#7c5cbf', '#b354a0', '#f2d3d0', '#fdf3d8'
];

export interface ColorPickerProps {
  label: string;
  value?: string;
  onSelect: (color: string) => void;
  swatches?: string[];
  onClose?: () => void;
}

/**
 * Popover color picker: a swatch grid plus a custom hex field. Used for
 * both text color and highlight — callers just supply a different
 * default swatch set and onSelect handler if needed.
 */
export function ColorPicker({ label, value, onSelect, swatches = SWATCHES, onClose }: ColorPickerProps) {
  const [hex, setHex] = useState(value ?? '#000000');
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent): void => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onClose?.();
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [onClose]);

  return (
    <div className="nova-wordpad-color-picker" ref={rootRef} role="dialog" aria-label={label}>
      <div className="nova-wordpad-color-picker__grid">
        {swatches.map((color) => (
          <button
            key={color}
            type="button"
            className="nova-wordpad-color-picker__swatch"
            style={{ backgroundColor: color }}
            aria-label={color}
            title={color}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(color)}
          />
        ))}
      </div>
      <form
        className="nova-wordpad-color-picker__custom"
        onSubmit={(e) => {
          e.preventDefault();
          onSelect(hex);
        }}
      >
        <input
          type="color"
          value={/^#[0-9a-f]{6}$/i.test(hex) ? hex : '#000000'}
          onChange={(e) => setHex(e.target.value)}
          aria-label="Pick custom color"
        />
        <input
          type="text"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          aria-label="Hex color value"
          placeholder="#000000"
        />
        <button type="submit" className="nova-wordpad-color-picker__apply">
          Apply
        </button>
      </form>
    </div>
  );
}
