import { useRef, useState, type JSX } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  onSelect: (color: string | null) => void;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  recentColors: string[];
}

const THEME_COLORS = [
  ['#000000', '#1a1a2e', '#16213e', '#0f3460', '#533483', '#e94560', '#f38181', '#fce38a', '#eaffd0', '#95e1d3'],
  ['#333333', '#2d3436', '#1e3799', '#0c2461', '#6c5ce7', '#fd79a8', '#fab1a0', '#ffeaa7', '#dfe6e9', '#81ecec'],
  ['#555555', '#636e72', '#3742fa', '#1e90ff', '#a29bfe', '#ff7675', '#ffcccc', '#fff3cd', '#c8d6e5', '#55efc4'],
  ['#777777', '#b2bec3', '#5352ed', '#48dbfb', '#c8d6e5', '#ff9ff3', '#ffd3b6', '#fffde7', '#dfe6e9', '#00cec9'],
  ['#999999', '#dfe6e9', '#70a1ff', '#7bed9f', '#f5f6fa', '#f368e0', '#ffe0b2', '#ffffff', '#f5f6fa', '#00b894'],
];

const STANDARD_COLORS = [
  '#c0392b', '#e74c3c', '#e67e22', '#f39c12', '#f1c40f',
  '#27ae60', '#2ecc71', '#1abc9c', '#2980b9', '#8e44ad',
];

export function NovaExcelColorPicker({ onSelect, onClose, anchorEl, recentColors }: Props): JSX.Element | null {
  const [showCustom, setShowCustom] = useState(false);
  const customRef = useRef<HTMLInputElement>(null);

  if (anchorEl == null) return null;

  const rect = anchorEl.getBoundingClientRect();
  let top = rect.bottom + 4;
  let left = rect.left;
  if (left + 220 > window.innerWidth) left = window.innerWidth - 228;
  if (top + 300 > window.innerHeight) top = rect.top - 300;

  const handleCustom = (): void => {
    setShowCustom(true);
    setTimeout(() => customRef.current?.click(), 50);
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div
        className="fixed z-[9999] w-[210px] rounded-md border border-border bg-surface shadow-lg p-2"
        style={{ top, left }}
      >
        {/* Theme Colors */}
        <p className="text-[9px] font-semibold text-text-muted mb-1">Theme Colors</p>
        <div className="flex flex-col gap-[2px] mb-2">
          {THEME_COLORS.map((row, ri) => (
            <div key={ri} className="flex gap-[2px]">
              {row.map((color) => (
                <button
                  key={color}
                  type="button"
                  className="w-[17px] h-[17px] rounded-sm border border-border-muted hover:border-primary hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: color }}
                  onClick={() => onSelect(color)}
                  title={color}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Standard Colors */}
        <p className="text-[9px] font-semibold text-text-muted mb-1">Standard Colors</p>
        <div className="flex gap-[2px] mb-2">
          {STANDARD_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className="w-[17px] h-[17px] rounded-sm border border-border-muted hover:border-primary hover:scale-110 transition-transform cursor-pointer"
              style={{ backgroundColor: color }}
              onClick={() => onSelect(color)}
              title={color}
            />
          ))}
        </div>

        {/* Recent Colors */}
        {recentColors.length > 0 && (
          <>
            <p className="text-[9px] font-semibold text-text-muted mb-1">Recent Colors</p>
            <div className="flex gap-[2px] mb-2">
              {recentColors.slice(0, 8).map((color, i) => (
                <button
                  key={`${color}-${i}`}
                  type="button"
                  className="w-[17px] h-[17px] rounded-sm border border-border-muted hover:border-primary hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: color }}
                  onClick={() => onSelect(color)}
                  title={color}
                />
              ))}
            </div>
          </>
        )}

        {/* Actions */}
        <div className="border-t border-border-muted pt-1.5 flex flex-col gap-1">
          <button
            type="button"
            className="text-[10px] text-text-muted hover:text-primary text-start px-1 py-0.5 rounded hover:bg-surface-muted transition-colors"
            onClick={handleCustom}
          >
            Custom Color...
          </button>
          <button
            type="button"
            className="text-[10px] text-text-muted hover:text-error text-start px-1 py-0.5 rounded hover:bg-surface-muted transition-colors"
            onClick={() => onSelect(null)}
          >
            No Color
          </button>
        </div>

        {/* Hidden native color input */}
        {showCustom && (
          <input
            ref={customRef}
            type="color"
            className="absolute opacity-0 w-0 h-0"
            onChange={(e) => { onSelect(e.target.value); setShowCustom(false); }}
            onBlur={() => setShowCustom(false)}
          />
        )}
      </div>
    </>,
    document.body
  );
}
