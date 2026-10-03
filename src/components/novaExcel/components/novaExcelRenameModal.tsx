import { useEffect, useRef, useState, type JSX } from 'react';
import { createPortal } from 'react-dom';
import { novaExcelTheme as th } from '../theme/novaExcelTheme';

interface Props {
  currentName: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export function NovaExcelRenameModal({ currentName, onSave, onCancel }: Props): JSX.Element {
  const [name, setName] = useState(currentName);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = (): void => {
    const trimmed = name.trim();
    if (trimmed === '') {
      setError('Sheet name cannot be empty');
      inputRef.current?.focus();
      return;
    }
    setError('');
    onSave(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter') { e.preventDefault(); handleSave(); }
    if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30" onClick={onCancel}>
      <div
        className="bg-surface border border-border rounded-lg shadow-lg p-4 min-w-[280px] max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xs font-semibold text-text mb-3">Rename Sheet</h3>

        <input
          ref={inputRef}
          className="w-full h-7 px-2 text-xs rounded border border-border bg-surface text-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/10"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          placeholder="Enter sheet name"
        />

        {error !== '' && (
          <p className="mt-1 text-[10px] text-error">{error}</p>
        )}

        <div className="flex items-center justify-end gap-2 mt-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-6 px-3 rounded border border-border text-[10px] font-medium text-text-muted hover:bg-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-6 px-3 rounded border border-primary bg-primary text-[10px] font-medium text-primary-foreground hover:bg-primary-hover transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
