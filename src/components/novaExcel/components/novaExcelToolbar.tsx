import { useEffect, useRef, useState, type JSX } from 'react';
import { createPortal } from 'react-dom';
import { novaExcelTheme as th } from '../theme/novaExcelTheme';
import { NovaExcelColorPicker } from './novaExcelColorPicker';
import { NovaExcelHelpModal } from './novaExcelHelpModal';

// ─── Alignment SVG Icons (3-line style) ─────────────────────────────────────
const AlignLeftIcon = (): JSX.Element => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="1" y1="3" x2="11" y2="3" />
    <line x1="1" y1="6" x2="8" y2="6" />
    <line x1="1" y1="9" x2="11" y2="9" />
  </svg>
);
const AlignCenterIcon = (): JSX.Element => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="1" y1="3" x2="11" y2="3" />
    <line x1="3" y1="6" x2="9" y2="6" />
    <line x1="1" y1="9" x2="11" y2="9" />
  </svg>
);
const AlignRightIcon = (): JSX.Element => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
    <line x1="1" y1="3" x2="11" y2="3" />
    <line x1="4" y1="6" x2="11" y2="6" />
    <line x1="1" y1="9" x2="11" y2="9" />
  </svg>
);

interface Props {
  onAddRow: () => void;
  onAddCol: () => void;
  onExport: () => void;
  onExportXlsx: () => void;
  onImport: (file: File) => void;
  onStyleChange: (style: React.CSSProperties) => void;
  onClearStyle: () => void;
  currentStyle: React.CSSProperties;
  onInsertRowAbove: () => void;
  onInsertRowBelow: () => void;
  onInsertColBefore: () => void;
  onInsertColAfter: () => void;
  onDeleteRow: () => void;
  onDeleteCol: () => void;
  showFormulaBar?: boolean;
  onToggleFormulaBar?: () => void;
  showGridLines?: boolean;
  onToggleGridLines?: () => void;
}

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36];

const FONT_FAMILIES: Array<{ label: string; value: string }> = [
  { label: 'Default', value: '' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
];

type MenuKey = 'file' | 'edit' | 'view' | null;

export function NovaExcelToolbar({
  onExport,
  onExportXlsx,
  onImport,
  onStyleChange,
  onClearStyle,
  currentStyle,
  onInsertRowAbove,
  onInsertRowBelow,
  onInsertColBefore,
  onInsertColAfter,
  onDeleteRow,
  onDeleteCol,
  showFormulaBar = true,
  onToggleFormulaBar,
  showGridLines = true,
  onToggleGridLines,
}: Props): JSX.Element {
  const [openMenu, setOpenMenu] = useState<MenuKey>(null);
  const [showTextColor, setShowTextColor] = useState(false);
  const [showBgColor, setShowBgColor] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [recentTextColors, setRecentTextColors] = useState<string[]>([]);
  const [recentBgColors, setRecentBgColors] = useState<string[]>([]);
  const [lastTextColor, setLastTextColor] = useState<string>('#c0392b');
  const [lastBgColor, setLastBgColor] = useState<string>('#f1c40f');

  const textColorRef = useRef<HTMLDivElement>(null);
  const bgColorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const menuBarRef = useRef<HTMLDivElement>(null);

  // ─── Tooltip ──────────────────────────────────────────────────────────────
  const [tip, setTip] = useState<{ label: string; shortcut?: string; x: number; y: number } | null>(null);
  const tipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tipProps = (label: string, shortcut?: string): React.HTMLAttributes<HTMLElement> => ({
    onMouseEnter: (e: React.MouseEvent) => {
      if (tipTimer.current != null) clearTimeout(tipTimer.current);
      const target = e.currentTarget as HTMLElement;
      tipTimer.current = setTimeout(() => {
        const rect = target.getBoundingClientRect();
        setTip({ label, shortcut, x: rect.left + rect.width / 2, y: rect.bottom + 6 });
      }, 500);
    },
    onMouseLeave: () => {
      if (tipTimer.current != null) clearTimeout(tipTimer.current);
      setTip(null);
    },
  });

  const isBold = currentStyle.fontWeight === 'bold';
  const isItalic = currentStyle.fontStyle === 'italic';
  const isUnderline = currentStyle.textDecoration === 'underline';
  const isWrap = currentStyle.whiteSpace === 'normal';
  const currentFontSize = parseInt(String(currentStyle.fontSize ?? '11'));
  const currentFontFamily = String(currentStyle.fontFamily ?? '');
  const currentAlign = (currentStyle.textAlign as string) ?? 'left';

  const toggleBold = (): void => onStyleChange({ fontWeight: isBold ? undefined : 'bold' });
  const toggleItalic = (): void => onStyleChange({ fontStyle: isItalic ? undefined : 'italic' });
  const toggleUnderline = (): void => onStyleChange({ textDecoration: isUnderline ? undefined : 'underline' });
  const toggleWrap = (): void => onStyleChange({ whiteSpace: isWrap ? 'nowrap' : 'normal' });
  const setAlign = (align: string): void => onStyleChange({ textAlign: align as React.CSSProperties['textAlign'] });
  const setFontSize = (size: number): void => onStyleChange({ fontSize: `${size}px` });
  const setFontFamily = (family: string): void => onStyleChange({ fontFamily: family === '' ? undefined : family });

  // Close menu on outside click
  useEffect(() => {
    if (openMenu == null) return;
    const handler = (e: MouseEvent): void => {
      if (menuBarRef.current != null && !menuBarRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenu]);

  const handleTextColor = (color: string | null): void => {
    if (color != null) {
      setLastTextColor(color);
      setRecentTextColors((prev) => [color, ...prev.filter((c) => c !== color)].slice(0, 8));
      onStyleChange({ color });
    } else {
      onStyleChange({ color: undefined });
    }
    setShowTextColor(false);
  };

  const handleBgColor = (color: string | null): void => {
    if (color != null) {
      setLastBgColor(color);
      setRecentBgColors((prev) => [color, ...prev.filter((c) => c !== color)].slice(0, 8));
      onStyleChange({ backgroundColor: color });
    } else {
      onStyleChange({ backgroundColor: undefined });
    }
    setShowBgColor(false);
  };

  const handleImportClick = (): void => {
    fileRef.current?.click();
    setOpenMenu(null);
  };

  const btnActive = 'bg-primary-subtle border-primary text-primary';

  const toggleMenu = (key: MenuKey): void => setOpenMenu(openMenu === key ? null : key);

  // Checkmark for View menu items
  const check = (active: boolean): string => active ? '✓ ' : '   ';

  return (
    <>
      {/* ─── Menu Bar ─── */}
      <div className={th.menuBar} ref={menuBarRef} onMouseDown={(e) => e.preventDefault()}>
        {/* File */}
        <div className="relative">
          <button type="button" className={th.menuItem} onClick={() => toggleMenu('file')}>File</button>
          {openMenu === 'file' && (
            <div className={th.menuDropdown}>
              <button type="button" className={th.menuDropdownItem} onClick={() => { onExport(); setOpenMenu(null); }}>Export as CSV</button>
              <button type="button" className={th.menuDropdownItem} onClick={() => { onExportXlsx(); setOpenMenu(null); }}>Export as XLSX</button>
              <div className={th.menuDivider} />
              <button type="button" className={th.menuDropdownItem} onClick={handleImportClick}>Import (CSV / XLSX)</button>
              <div className={th.menuDivider} />
              <button type="button" className={th.menuDropdownItem} onClick={() => { onClearStyle(); setOpenMenu(null); }}>Clear Formatting</button>
            </div>
          )}
        </div>

        {/* Edit */}
        <div className="relative">
          <button type="button" className={th.menuItem} onClick={() => toggleMenu('edit')}>Edit</button>
          {openMenu === 'edit' && (
            <div className={th.menuDropdown}>
              <button type="button" className={th.menuDropdownItem} onClick={() => { onInsertRowAbove(); setOpenMenu(null); }}>Insert Row Above</button>
              <button type="button" className={th.menuDropdownItem} onClick={() => { onInsertRowBelow(); setOpenMenu(null); }}>Insert Row Below</button>
              <div className={th.menuDivider} />
              <button type="button" className={th.menuDropdownItem} onClick={() => { onInsertColBefore(); setOpenMenu(null); }}>Insert Column Before</button>
              <button type="button" className={th.menuDropdownItem} onClick={() => { onInsertColAfter(); setOpenMenu(null); }}>Insert Column After</button>
              <div className={th.menuDivider} />
              <button type="button" className={th.menuDropdownItem} onClick={() => { onDeleteRow(); setOpenMenu(null); }}>Delete Row</button>
              <button type="button" className={th.menuDropdownItem} onClick={() => { onDeleteCol(); setOpenMenu(null); }}>Delete Column</button>
            </div>
          )}
        </div>

        {/* View */}
        <div className="relative">
          <button type="button" className={th.menuItem} onClick={() => toggleMenu('view')}>View</button>
          {openMenu === 'view' && (
            <div className={th.menuDropdown}>
              <button type="button" className={th.menuDropdownItem} onClick={() => { onToggleFormulaBar?.(); setOpenMenu(null); }}>
                <span className="w-3 inline-block">{check(showFormulaBar)}</span>Formula Bar
              </button>
              <button type="button" className={th.menuDropdownItem} onClick={() => { onToggleGridLines?.(); setOpenMenu(null); }}>
                <span className="w-3 inline-block">{check(showGridLines)}</span>Grid Lines
              </button>
              <div className={th.menuDivider} />
              <button type="button" className={th.menuDropdownItem} onClick={() => { setShowHelp(true); setOpenMenu(null); }}>Help</button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Format Toolbar ─── */}
      <div className={th.toolbar} onMouseDown={(e) => e.preventDefault()}>
        {/* Text formatting */}
        <button type="button" className={`${th.toolbarBtn} font-bold ${isBold ? btnActive : ''}`} onClick={toggleBold} {...tipProps('Bold', 'Ctrl+B')}>B</button>
        <button type="button" className={`${th.toolbarBtn} italic ${isItalic ? btnActive : ''}`} onClick={toggleItalic} {...tipProps('Italic', 'Ctrl+I')}>I</button>
        <button type="button" className={`${th.toolbarBtn} underline ${isUnderline ? btnActive : ''}`} onClick={toggleUnderline} {...tipProps('Underline', 'Ctrl+U')}>U</button>

        <span className="w-px h-4 bg-border-muted mx-1" />

        {/* Font family */}
        <select
          className="h-[22px] w-[110px] px-1 rounded border border-border bg-surface text-[10px] text-text focus:border-primary focus:outline-none"
          value={currentFontFamily}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => setFontFamily(e.target.value)}
          title="Font Family"
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f.label} value={f.value} style={{ fontFamily: f.value || undefined }}>{f.label}</option>
          ))}
        </select>

        {/* Font size */}
        <select
          className="h-[22px] px-1 rounded border border-border bg-surface text-[10px] text-text focus:border-primary focus:outline-none"
          value={currentFontSize}
          onMouseDown={(e) => e.stopPropagation()}
          onChange={(e) => setFontSize(Number(e.target.value))}
        >
          {FONT_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <span className="w-px h-4 bg-border-muted mx-1" />

        {/* Text Color — split button */}
        <div ref={textColorRef} className={th.splitBtn}>
          <button
            type="button"
            className={th.splitBtnMain}
            onClick={() => onStyleChange({ color: lastTextColor })}
            {...tipProps('Text Color')}
          >
            <span style={{ borderBottomWidth: 3, borderBottomStyle: 'solid', borderBottomColor: lastTextColor, lineHeight: 1 }}>A</span>
          </button>
          <button
            type="button"
            className={th.splitBtnArrow}
            onClick={() => setShowTextColor(!showTextColor)}
            title="Pick text color"
          >
            ▾
          </button>
        </div>

        {/* Background Color — split button */}
        <div ref={bgColorRef} className={th.splitBtn}>
          <button
            type="button"
            className={th.splitBtnMain}
            onClick={() => onStyleChange({ backgroundColor: lastBgColor })}
            {...tipProps('Fill Color')}
          >
            <span style={{ borderBottomWidth: 3, borderBottomStyle: 'solid', borderBottomColor: lastBgColor, lineHeight: 1 }}>▐</span>
          </button>
          <button
            type="button"
            className={th.splitBtnArrow}
            onClick={() => setShowBgColor(!showBgColor)}
            title="Pick fill color"
          >
            ▾
          </button>
        </div>

        <span className="w-px h-4 bg-border-muted mx-1" />

        {/* Alignment */}
        <button type="button" className={`${th.toolbarBtn} ${currentAlign === 'left' ? btnActive : ''}`} onClick={() => setAlign('left')} {...tipProps('Align Left')}><AlignLeftIcon /></button>
        <button type="button" className={`${th.toolbarBtn} ${currentAlign === 'center' ? btnActive : ''}`} onClick={() => setAlign('center')} {...tipProps('Align Center')}><AlignCenterIcon /></button>
        <button type="button" className={`${th.toolbarBtn} ${currentAlign === 'right' ? btnActive : ''}`} onClick={() => setAlign('right')} {...tipProps('Align Right')}><AlignRightIcon /></button>

        <span className="w-px h-4 bg-border-muted mx-1" />

        {/* Wrap */}
        <button type="button" className={`${th.toolbarBtn} ${isWrap ? btnActive : ''}`} onClick={toggleWrap} {...tipProps('Wrap Text')}>↩</button>
      </div>

      {/* Hidden file input for import */}
      <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onImport(f); e.target.value = ''; }} />

      {/* Color Pickers */}
      {showTextColor && (
        <NovaExcelColorPicker
          anchorEl={textColorRef.current}
          onSelect={handleTextColor}
          onClose={() => setShowTextColor(false)}
          recentColors={recentTextColors}
        />
      )}
      {showBgColor && (
        <NovaExcelColorPicker
          anchorEl={bgColorRef.current}
          onSelect={handleBgColor}
          onClose={() => setShowBgColor(false)}
          recentColors={recentBgColors}
        />
      )}

      {/* Help Modal */}
      {showHelp && <NovaExcelHelpModal onClose={() => setShowHelp(false)} />}

      {/* Tooltip */}
      {tip != null && createPortal(
        <div className={th.tooltip} style={{ left: tip.x, top: tip.y }}>
          <div className={th.tooltipArrow} />
          <div className={th.tooltipArrowInner} />
          <div>{tip.label}</div>
          {tip.shortcut != null && <div className={th.tooltipShortcut}>{tip.shortcut}</div>}
        </div>,
        document.body,
      )}
    </>
  );
}
