import { useState, useRef, useEffect, type JSX } from 'react';
import { createPortal } from 'react-dom';
import { novaExcelTheme as th } from '../theme/novaExcelTheme';
import { NovaExcelRenameModal } from './novaExcelRenameModal';
import { formatStat } from '../utils/novaExcel.helpers';
import { useNovaExcelClampedPosition } from '../hooks/useNovaExcelClampedPosition';
import type { Sheet, SelectionStats } from '../types/novaExcel.types';
import clsx from 'clsx';

interface Props {
  sheets: Sheet[];
  activeSheet: number;
  onSwitchSheet: (idx: number) => void;
  onAddSheet: () => void;
  onRenameSheet: (idx: number, name: string) => void;
  onDeleteSheet: (idx: number) => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  selectedCell: string | null;
  selectionStats: SelectionStats | null;
}

interface TabContextMenu {
  index: number;
  x: number;
  y: number;
}

export function NovaExcelSheetTabs({
  sheets,
  activeSheet,
  onSwitchSheet,
  onAddSheet,
  onRenameSheet,
  onDeleteSheet,
  zoom,
  onZoomChange,
  selectedCell,
  selectionStats,
}: Props): JSX.Element {
  const [contextMenu, setContextMenu] = useState<TabContextMenu | null>(null);
  const [renameIndex, setRenameIndex] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const { ref: contextMenuRef, style: contextMenuStyle } = useNovaExcelClampedPosition(contextMenu?.x ?? 0, contextMenu?.y ?? 0);

  // Scroll active tab into view when it changes
  useEffect(() => {
    setTimeout(() => {
      activeTabRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }, 50);
  }, [activeSheet]);

  // Also scroll into view when a new sheet is added
  useEffect(() => {
    setTimeout(() => {
      activeTabRef.current?.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });
    }, 50);
  }, [sheets.length]);

  const scrollTabs = (dir: 'left' | 'right'): void => {
    if (tabsRef.current == null) return;
    tabsRef.current.scrollBy({ left: dir === 'right' ? 100 : -100, behavior: 'smooth' });
  };

  const handleContextMenu = (e: React.MouseEvent, idx: number): void => {
    e.preventDefault();
    setContextMenu({ index: idx, x: e.clientX, y: e.clientY });
  };

  const closeContext = (): void => setContextMenu(null);

  return (
    <>
      <div className="flex items-center h-[24px] border-t border-border bg-surface-muted">
        {/* Left section: arrows + tabs + add */}
        <div className="flex items-center min-w-0 flex-shrink overflow-hidden">
          {/* Left arrow */}
          <button
            type="button"
            onClick={() => scrollTabs('left')}
            className="h-[24px] w-[20px] flex items-center justify-center text-text-muted hover:bg-surface-hover hover:text-text cursor-pointer text-[12px] flex-shrink-0 border-e border-border"
          >
            ‹
          </button>

          {/* Right arrow */}
          <button
            type="button"
            onClick={() => scrollTabs('right')}
            className="h-[24px] w-[20px] flex items-center justify-center text-text-muted hover:bg-surface-hover hover:text-text cursor-pointer text-[12px] flex-shrink-0 border-e border-border"
          >
            ›
          </button>

          {/* Tabs — max-content, no empty space */}
          <div
            ref={tabsRef}
            className="flex items-end overflow-x-auto scrollbar-none"
            style={{ maxWidth: 'min(100%, max-content)' }}
          >
            {sheets.map((s, i) => (
              <button
                key={i}
                ref={i === activeSheet ? activeTabRef : undefined}
                type="button"
                className={clsx(
                  'relative h-[22px] px-3 text-[10px] font-medium whitespace-nowrap',
                  'border-t border-e border-s border-border-muted rounded-t-sm cursor-pointer transition-colors flex-shrink-0',
                  i === activeSheet
                    ? 'bg-surface text-primary font-semibold border-b-surface -mb-px z-10'
                    : 'bg-surface-muted text-text-muted hover:bg-surface-hover hover:text-text border-b border-border-muted',
                )}
                onClick={() => onSwitchSheet(i)}
                onDoubleClick={() => { closeContext(); setRenameIndex(i); }}
                onContextMenu={(e) => handleContextMenu(e, i)}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Add sheet */}
          <button
            type="button"
            onClick={onAddSheet}
            className="h-[22px] w-[22px] flex items-center justify-center text-text-muted hover:bg-primary-subtle hover:text-primary cursor-pointer transition-colors text-[13px] font-medium flex-shrink-0 ms-0.5"
          >
            +
          </button>
        </div>

        {/* Right section: selection stats + cell info + zoom */}
        <div className="flex items-center gap-2 ms-auto flex-shrink-0 pe-2 ps-3 border-s border-border h-full">
          {/* Selection stats — Count / Sum / Average (shown once a range is selected) */}
          {selectionStats != null && selectionStats.count > 1 && (
            <div className="flex items-center gap-2.5 text-[10px] font-medium text-text-muted me-2">
              {selectionStats.numericCount > 0 && (
                <>
                  <span>Average: <span className="text-text">{formatStat(selectionStats.average)}</span></span>
                  <span>Sum: <span className="text-text">{formatStat(selectionStats.sum)}</span></span>
                </>
              )}
              <span>Count: <span className="text-text">{selectionStats.count}</span></span>
            </div>
          )}

          {/* Selected cell */}
          {selectedCell != null && (
            <span className="text-[10px] text-text-muted font-medium me-2">{selectedCell}</span>
          )}

          {/* Zoom */}
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(50, zoom - 10))}
            className="h-[14px] w-[14px] flex items-center justify-center rounded text-[10px] text-text-muted hover:text-text hover:bg-surface-hover cursor-pointer"
          >
            −
          </button>
          <input
            type="range"
            min={50}
            max={200}
            step={10}
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="w-[70px] h-[3px] accent-primary cursor-pointer"
          />
          <button
            type="button"
            onClick={() => onZoomChange(Math.min(200, zoom + 10))}
            className="h-[14px] w-[14px] flex items-center justify-center rounded text-[10px] text-text-muted hover:text-text hover:bg-surface-hover cursor-pointer"
          >
            +
          </button>
          <span className="text-[9px] text-text-muted w-7 text-end">{zoom}%</span>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu != null && createPortal(
        <>
          {/* Backdrop to close on outside click */}
          <div className="fixed inset-0 z-[9998]" onClick={closeContext} />
          <div ref={contextMenuRef} className={th.contextMenu} style={contextMenuStyle}>
            <div className={th.contextMenuItem} onClick={() => { setRenameIndex(contextMenu.index); closeContext(); }}>Rename</div>
            {sheets.length > 1 && (
              <div className={th.contextMenuItem} onClick={() => { setConfirmDelete(contextMenu.index); closeContext(); }}>Delete</div>
            )}
          </div>
        </>,
        document.body
      )}

      {/* Rename Modal */}
      {renameIndex != null && (
        <NovaExcelRenameModal
          currentName={sheets[renameIndex]?.name ?? ''}
          onSave={(name) => { onRenameSheet(renameIndex, name); setRenameIndex(null); }}
          onCancel={() => setRenameIndex(null)}
        />
      )}

      {/* Delete Confirm */}
      {confirmDelete != null && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30" onClick={() => setConfirmDelete(null)}>
          <div className="bg-surface border border-border rounded-lg shadow-lg p-4 min-w-[260px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xs font-semibold text-text mb-2">Delete Sheet</h3>
            <p className="text-[11px] text-text-muted mb-4">
              Delete &quot;{sheets[confirmDelete]?.name}&quot;? This cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setConfirmDelete(null)} className="h-6 px-3 rounded border border-border text-[10px] font-medium text-text-muted hover:bg-surface-hover transition-colors">Cancel</button>
              <button type="button" onClick={() => { onDeleteSheet(confirmDelete); setConfirmDelete(null); }} className="h-6 px-3 rounded border border-error bg-error text-[10px] font-medium text-error-foreground hover:bg-error/90 transition-colors">Delete</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
