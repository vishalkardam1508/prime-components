import { useEffect, useRef, useState } from 'react';
import './TableGridPicker.css';

const MAX_ROWS = 8;
const MAX_COLS = 8;

export interface TableGridSelection {
  rows: number;
  cols: number;
}

export interface TableGridPickerProps {
  onSelect: (selection: TableGridSelection) => void;
  onClose?: () => void;
}

/**
 * Hover grid for choosing table dimensions, like the classic WordPad/
 * Word "Insert Table" grid. Confirms on click.
 */
export function TableGridPicker({ onSelect, onClose }: TableGridPickerProps) {
  const [hover, setHover] = useState<TableGridSelection>({ rows: 0, cols: 0 });
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent): void => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onClose?.();
    };
    const onEsc = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [onClose]);

  return (
    <div className="nova-wordpad-table-grid-picker" ref={rootRef} role="dialog" aria-label="Insert Table">
      <div
        className="nova-wordpad-table-grid-picker__grid"
        style={{ gridTemplateColumns: `repeat(${MAX_COLS}, 18px)` }}
        onMouseLeave={() => setHover({ rows: 0, cols: 0 })}
      >
        {Array.from({ length: MAX_ROWS * MAX_COLS }).map((_, i) => {
          const row = Math.floor(i / MAX_COLS) + 1;
          const col = (i % MAX_COLS) + 1;
          const active = row <= hover.rows && col <= hover.cols;
          return (
            <button
              key={i}
              type="button"
              className={`nova-wordpad-table-grid-picker__cell${
                active ? ' nova-wordpad-table-grid-picker__cell--active' : ''
              }`}
              onMouseEnter={() => setHover({ rows: row, cols: col })}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect({ rows: row, cols: col });
                onClose?.();
              }}
              aria-label={`${row} by ${col} table`}
            />
          );
        })}
      </div>
      <p className="nova-wordpad-table-grid-picker__label">
        {hover.rows > 0 ? `${hover.rows} × ${hover.cols} Table` : 'Insert Table'}
      </p>
    </div>
  );
}
