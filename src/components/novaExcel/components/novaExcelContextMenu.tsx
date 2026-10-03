import { useState, type JSX } from 'react';
import { createPortal } from 'react-dom';
import { useNovaExcelClampedPosition } from '../hooks/useNovaExcelClampedPosition';
import clsx from 'clsx';

export type ContextAction =
  | 'insertAbove' | 'insertBelow'
  | 'insertBefore' | 'insertAfter'
  | 'cut' | 'copy' | 'paste'
  | 'delete' | 'filter';

interface Props {
  type: 'row' | 'col';
  index: number;
  x: number;
  y: number;
  hasFilter?: boolean;
  onAction: (action: ContextAction) => void;
  onClose: () => void;
}

/* Small inline SVG icons */
const Icons = {
  insertAbove: () => (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M8 11V5M5 7l3-3 3 3" /><path d="M3 14h10" />
    </svg>
  ),
  insertBelow: () => (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M8 5v6M5 9l3 3 3-3" /><path d="M3 2h10" />
    </svg>
  ),
  insertBefore: () => (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M11 8H5M7 5L4 8l3 3" /><path d="M14 3v10" />
    </svg>
  ),
  insertAfter: () => (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M5 8h6M9 5l3 3-3 3" /><path d="M2 3v10" />
    </svg>
  ),
  cut: () => (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="5" cy="12" r="2" /><circle cx="11" cy="12" r="2" /><path d="M6.5 10.5L11 3M9.5 10.5L5 3" />
    </svg>
  ),
  copy: () => (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="5" width="8" height="8" rx="1" /><path d="M3 11V3h8" />
    </svg>
  ),
  paste: () => (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="10" height="10" rx="1" /><path d="M6 2h4v3H6z" />
    </svg>
  ),
  delete: () => (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 4h10M6 4V3h4v1M5 4v9h6V4" /><path d="M7 7v4M9 7v4" />
    </svg>
  ),
  filter: () => (
    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M2 3h12M4 7.5h8M6.5 12h3" />
    </svg>
  ),
};

function MenuItem({ icon, label, danger, onClick }: { icon: JSX.Element; label: string; danger?: boolean; onClick: () => void }): JSX.Element {
  return (
    <div
      className={clsx(
        'flex items-center gap-2 px-3 py-1.5 text-[11px] cursor-pointer transition-colors',
        danger ? 'text-error hover:bg-error-subtle' : 'text-text-muted hover:bg-surface-muted hover:text-text',
      )}
      onClick={onClick}
    >
      <span className="w-3 flex-shrink-0">{icon}</span>
      {label}
    </div>
  );
}

function Divider(): JSX.Element {
  return <div className="border-t border-border-muted my-0.5" />;
}

export function NovaExcelContextMenu({ type, index, x, y, hasFilter, onAction, onClose }: Props): JSX.Element {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { ref: menuRef, style: menuStyle } = useNovaExcelClampedPosition(x, y);

  const handleDelete = (): void => {
    setConfirmDelete(true);
  };

  const confirmDeleteNow = (): void => {
    onAction('delete');
    setConfirmDelete(false);
  };

  return createPortal(
    <>
      {/* Backdrop to close */}
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />

      {/* Menu */}
      <div
        ref={menuRef}
        className="fixed z-[9999] min-w-[170px] rounded-md border border-border bg-surface shadow-lg py-1"
        style={menuStyle}
      >
        {type === 'row' ? (
          <>
            <MenuItem icon={<Icons.insertAbove />} label="Insert Row Above" onClick={() => onAction('insertAbove')} />
            <MenuItem icon={<Icons.insertBelow />} label="Insert Row Below" onClick={() => onAction('insertBelow')} />
            <Divider />
            <MenuItem icon={<Icons.cut />} label="Cut Row" onClick={() => onAction('cut')} />
            <MenuItem icon={<Icons.copy />} label="Copy Row" onClick={() => onAction('copy')} />
            <MenuItem icon={<Icons.paste />} label="Paste Row" onClick={() => onAction('paste')} />
            <Divider />
            <MenuItem icon={<Icons.delete />} label="Delete Row" danger onClick={handleDelete} />
          </>
        ) : (
          <>
            <MenuItem icon={<Icons.insertBefore />} label="Insert Column Before" onClick={() => onAction('insertBefore')} />
            <MenuItem icon={<Icons.insertAfter />} label="Insert Column After" onClick={() => onAction('insertAfter')} />
            <Divider />
            <MenuItem icon={<Icons.cut />} label="Cut Column" onClick={() => onAction('cut')} />
            <MenuItem icon={<Icons.copy />} label="Copy Column" onClick={() => onAction('copy')} />
            <MenuItem icon={<Icons.paste />} label="Paste Column" onClick={() => onAction('paste')} />
            <Divider />
            <MenuItem icon={<Icons.filter />} label={hasFilter ? 'Remove Filter' : 'Add Filter'} onClick={() => onAction('filter')} />
            <Divider />
            <MenuItem icon={<Icons.delete />} label="Delete Column" danger onClick={handleDelete} />
          </>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30" onClick={() => setConfirmDelete(false)}>
          <div className="bg-surface border border-border rounded-lg shadow-lg p-4 min-w-[250px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xs font-semibold text-text mb-2">
              Delete {type === 'row' ? `Row ${index}` : `Column`}
            </h3>
            <p className="text-[11px] text-text-muted mb-4">
              This will permanently delete the {type} and shift remaining data. Continue?
            </p>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setConfirmDelete(false)} className="h-6 px-3 rounded border border-border text-[10px] font-medium text-text-muted hover:bg-surface-hover transition-colors">Cancel</button>
              <button type="button" onClick={confirmDeleteNow} className="h-6 px-3 rounded border border-error bg-error text-[10px] font-medium text-error-foreground hover:bg-error/90 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}
