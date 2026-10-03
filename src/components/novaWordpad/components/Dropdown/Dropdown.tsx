import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import './Dropdown.css';

export interface DropdownOption<TValue extends string | number = string> {
  value: TValue;
  label: string;
}

export interface DropdownProps<TValue extends string | number = string> {
  label: string;
  value: TValue;
  options: DropdownOption<TValue>[];
  onChange: (value: TValue) => void;
  width?: number;
  renderOption?: (option: DropdownOption<TValue>) => ReactNode;
}

/**
 * Generic labeled dropdown used for font family/size, headings, zoom, etc.
 * Keeps focus management self-contained so feature components only need
 * to supply data + onChange.
 */
export function Dropdown<TValue extends string | number = string>({
  label,
  value,
  options,
  onChange,
  width = 140,
  renderOption
}: DropdownProps<TValue>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent): void => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const current = options.find((o) => String(o.value) === String(value));

  return (
    <div className="nova-wordpad-dropdown" ref={rootRef} style={{ width }}>
      <button
        type="button"
        className="nova-wordpad-dropdown__trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        title={label}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="nova-wordpad-dropdown__value">{current ? current.label : label}</span>
        <span className="nova-wordpad-dropdown__caret" aria-hidden="true">
          ▾
        </span>
      </button>
      {open && (
        <ul className="nova-wordpad-dropdown__panel" role="listbox" aria-label={label}>
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={String(opt.value) === String(value)}
              className={`nova-wordpad-dropdown__option${
                String(opt.value) === String(value) ? ' nova-wordpad-dropdown__option--selected' : ''
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {renderOption ? renderOption(opt) : opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
