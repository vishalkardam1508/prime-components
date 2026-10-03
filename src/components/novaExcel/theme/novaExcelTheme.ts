export const novaExcelTheme = {
  root: 'flex flex-col w-full border border-border rounded-md bg-surface overflow-hidden text-xs',

  // ─── Menu Bar ──
  menuBar: 'flex items-center gap-0 px-1 h-[22px] border-b border-border bg-surface-muted',
  menuItem: [
    'relative h-[20px] px-2 text-[10px] font-medium text-text-muted',
    'hover:bg-surface-hover hover:text-text cursor-pointer rounded-sm',
    'flex items-center',
  ].join(' '),
  menuDropdown: [
    'absolute top-full start-0 z-[9999] min-w-[140px] rounded border border-border',
    'bg-surface shadow-lg py-0.5 mt-0.5',
  ].join(' '),
  menuDropdownItem: [
    'px-3 py-1 text-[10px] text-text-muted cursor-pointer',
    'hover:bg-surface-muted hover:text-text transition-colors',
    'flex items-center gap-2',
  ].join(' '),
  menuDivider: 'border-t border-border-muted my-0.5',

  // ─── Toolbar ──
  toolbar: 'flex items-center gap-1 px-2 py-0.5 border-b border-border bg-surface-muted flex-wrap min-h-[28px]',
  toolbarBtn: [
    'h-[22px] px-1.5 rounded border border-border bg-surface text-[10px] font-medium text-text-muted',
    'hover:border-primary hover:text-primary hover:bg-primary-subtle',
    'transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center',
  ].join(' '),
  toolbarBtnDanger: [
    'h-[22px] px-2 rounded border border-border bg-surface text-[10px] font-medium text-text-muted',
    'hover:border-error hover:text-error hover:bg-error-subtle',
    'transition-colors cursor-pointer whitespace-nowrap',
  ].join(' '),
  toolbarUpload: [
    'h-[22px] px-2 rounded border border-border bg-surface text-[10px] font-medium text-text-muted',
    'hover:border-primary hover:text-primary hover:bg-primary-subtle',
    'transition-colors cursor-pointer whitespace-nowrap inline-flex items-center',
    '[&>input]:hidden',
  ].join(' '),
  // Split button (color)
  splitBtn: 'flex items-center h-[22px] rounded border border-border bg-surface overflow-hidden',
  splitBtnMain: [
    'h-full px-1.5 text-[10px] font-medium text-text-muted',
    'hover:bg-primary-subtle hover:text-primary cursor-pointer',
    'flex items-center justify-center',
  ].join(' '),
  splitBtnArrow: [
    'h-full px-0.5 text-[10px] text-text-muted border-s border-border',
    'hover:bg-primary-subtle hover:text-primary cursor-pointer',
    'flex items-center justify-center',
  ].join(' '),

  // ─── Formula Bar ──
  formulaBar: 'flex items-center gap-2 px-2 h-[24px] border-b border-border bg-surface',
  formulaLabel: 'text-[10px] font-bold text-primary select-none',
  formulaCellRef: 'text-[10px] font-medium text-text-muted w-12 text-center border-e border-border pe-2',
  formulaInput: [
    'flex-1 h-[20px] px-2 text-[11px] bg-transparent text-text',
    'outline-none border-none',
    'placeholder:text-text-subtle',
  ].join(' '),

  // ─── Grid Container ──
  gridContainer: 'flex-1 overflow-auto relative [transform:translateZ(0)]',
  sheetLoader: 'absolute inset-0 z-40 bg-surface/70 backdrop-blur-[1px] flex items-center justify-center',
  table: 'border-separate border-spacing-0 table-fixed',

  // ─── Corner ──
  corner: 'sticky top-0 start-0 z-30 w-9 min-w-9 h-[18px] bg-surface-muted border-b border-e border-border',

  // ─── Column Header ──
  colHeader: [
    'sticky top-0 z-20 bg-surface-muted',
    'h-[18px] px-0 text-[10px] font-medium text-text-muted text-center',
    'border-b border-e border-border select-none',
    'hover:bg-surface-hover relative',
  ].join(' '),
  colHeaderSelected: 'bg-primary/20 text-primary font-semibold',
  colResizer: [
    'absolute top-0 end-0 w-[4px] h-full cursor-col-resize z-10',
    'hover:bg-primary/50 active:bg-primary',
  ].join(' '),

  // ─── Row Header ──
  rowHeader: [
    'sticky start-0 z-10 bg-surface-muted',
    'w-9 min-w-9 text-[10px] font-medium text-text-muted text-center',
    'border-b border-e border-border select-none',
    'hover:bg-surface-hover',
  ].join(' '),
  rowHeaderSelected: 'bg-primary/20 text-primary font-semibold',

  // ─── Cell ──
  cell: [
    'relative px-0 text-[11px] text-text',
    'border-b border-e border-border-muted',
    'cursor-cell select-none',
  ].join(' '),
  cellSelected: 'ring-1 ring-primary ring-inset z-10',
  cellEditing: 'ring-1 ring-primary ring-inset z-10',
  cellInRange: 'bg-primary/15',
  cellContent: 'w-full h-full px-1 flex items-center truncate',
  cellInput: [
    'w-full h-full px-1 text-[11px] bg-transparent text-text',
    'outline-none border-none',
  ].join(' '),
  fillHandle: [
    'absolute w-[7px] h-[7px] bg-primary border border-surface',
    'cursor-crosshair z-20',
    'bottom-[-3px] end-[-3px]',
  ].join(' '),
  fillPreview: 'absolute border-2 border-dashed border-primary/60 pointer-events-none z-15 bg-primary/5',

  // ─── Sheet Tabs ──
  footer: 'flex items-center justify-between h-[22px] border-t border-border bg-surface-muted px-1',
  sheetTabs: 'flex items-center gap-0 overflow-hidden flex-1',
  sheetTabsList: 'flex items-center gap-0 overflow-x-auto scrollbar-none',
  sheetTab: [
    'h-[18px] px-2 text-[10px] font-medium text-text-muted',
    'border border-transparent cursor-pointer whitespace-nowrap',
    'hover:bg-surface-hover hover:text-text',
    'transition-colors rounded-t',
  ].join(' '),
  sheetTabActive: 'bg-surface border-border border-b-surface text-primary font-semibold',
  sheetTabAdd: [
    'h-[18px] w-[18px] flex items-center justify-center text-text-muted',
    'hover:bg-primary-subtle hover:text-primary cursor-pointer transition-colors',
    'text-[11px] font-medium rounded',
  ].join(' '),
  sheetTabInput: 'h-[18px] px-1 text-[10px] border border-primary rounded bg-surface text-text w-16 outline-none',
  scrollArrow: 'h-[18px] w-[16px] flex items-center justify-center text-text-muted hover:bg-surface-hover cursor-pointer text-[10px]',

  // ─── Footer Info ──
  footerInfo: 'text-[10px] text-text-muted px-2',

  // ─── Tooltip ──
  tooltip: [
    'fixed z-[9999] px-2 py-1 rounded border border-border bg-surface shadow-md',
    'text-[10px] font-medium text-text whitespace-nowrap pointer-events-none',
    'translate-x-[-50%]',
  ].join(' '),
  tooltipShortcut: 'text-[9px] text-text-subtle mt-0.5',
  tooltipArrow: 'absolute -top-[5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-b-[5px] border-l-transparent border-r-transparent border-b-border',
  tooltipArrowInner: 'absolute -top-[4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-b-[5px] border-l-transparent border-r-transparent border-b-surface',

  // ─── Context Menu ──
  contextMenu: [
    'fixed z-[9999] min-w-[150px] rounded border border-border',
    'bg-surface shadow-lg py-0.5',
  ].join(' '),
  contextMenuItem: [
    'px-3 py-1 text-[11px] text-text-muted cursor-pointer',
    'hover:bg-surface-muted hover:text-text transition-colors',
  ].join(' '),
  contextMenuDivider: 'border-t border-border-muted my-0.5',
} as const;
