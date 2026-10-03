import type { JSX } from 'react';
import { createPortal } from 'react-dom';

interface Props {
  onClose: () => void;
}

const FORMULA_CATEGORIES = [
  {
    title: 'Math',
    fns: 'SUM, SUMIF, SUMIFS, SUMPRODUCT, ABS, ROUND, ROUNDUP, ROUNDDOWN, CEILING, FLOOR, POWER, SQRT, MOD, INT, RAND, RANDBETWEEN, PI, LOG, LOG10, LN, EXP, SIGN, PRODUCT, QUOTIENT',
  },
  {
    title: 'Statistics',
    fns: 'AVERAGE, AVERAGEIF, AVERAGEIFS, MIN, MAX, COUNT, COUNTA, COUNTBLANK, COUNTIF, COUNTIFS, MEDIAN, STDEV, STDEV.S, STDEV.P, VAR, VAR.S, VAR.P, LARGE, SMALL, MODE, PERCENTILE',
  },
  {
    title: 'Logical',
    fns: 'IF, IFS, AND, OR, XOR, NOT, IFERROR, IFNA, SWITCH, TRUE, FALSE, CHOOSE',
  },
  {
    title: 'Text',
    fns: 'CONCATENATE, CONCAT, LEFT, RIGHT, MID, LEN, UPPER, LOWER, PROPER, TRIM, CLEAN, SUBSTITUTE, FIND, SEARCH, REPLACE, REPT, TEXT, VALUE, EXACT, T, CHAR, CODE, TEXTJOIN, NUMBERVALUE',
  },
  {
    title: 'Lookup',
    fns: 'VLOOKUP, HLOOKUP, INDEX, MATCH, XLOOKUP, LOOKUP',
  },
  {
    title: 'Date & Time',
    fns: 'TODAY, NOW, DATE, DATEVALUE, YEAR, MONTH, DAY, HOUR, MINUTE, SECOND, DATEDIF, EDATE, EOMONTH, WEEKDAY, NETWORKDAYS, DAYS, TIME',
  },
  {
    title: 'Information',
    fns: 'ISBLANK, ISNUMBER, ISTEXT, ISLOGICAL, ISERROR, ISERR, ISNA, ISODD, ISEVEN, TYPE, N, NA, ERROR.TYPE',
  },
  {
    title: 'Reference',
    fns: 'ROW, COLUMN, ROWS, COLUMNS, ADDRESS',
  },
];

export function NovaExcelHelpModal({ onClose }: Props): JSX.Element {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-surface border border-border rounded-lg shadow-lg p-5 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-text">Nova Excel — Help</h2>
          <button type="button" onClick={onClose} className="text-text-muted hover:text-text text-lg leading-none">&times;</button>
        </div>

        {/* Menu Bar */}
        <h3 className="text-xs font-semibold text-primary mb-1">Menu Bar</h3>
        <table className="w-full text-[11px] mb-4">
          <tbody className="divide-y divide-border-muted">
            <tr><td className="py-1 font-medium text-text-muted w-24">File</td><td className="py-1 text-text">Export CSV, Export XLSX, Import (CSV/XLSX), Clear Formatting</td></tr>
            <tr><td className="py-1 font-medium text-text-muted">Edit</td><td className="py-1 text-text">Insert/Delete Row (above/below), Insert/Delete Column (before/after)</td></tr>
            <tr><td className="py-1 font-medium text-text-muted">View</td><td className="py-1 text-text">Toggle Formula Bar, Toggle Grid Lines, Help</td></tr>
          </tbody>
        </table>

        {/* Keyboard Shortcuts */}
        <h3 className="text-xs font-semibold text-primary mb-1">Keyboard Shortcuts</h3>
        <table className="w-full text-[11px] mb-4">
          <tbody className="divide-y divide-border-muted">
            <tr><td className="py-1 font-medium text-text-muted w-32">Double-click / F2</td><td className="py-1 text-text">Edit cell</td></tr>
            <tr><td className="py-1 font-medium text-text-muted">Enter</td><td className="py-1 text-text">Commit &amp; move down</td></tr>
            <tr><td className="py-1 font-medium text-text-muted">Tab</td><td className="py-1 text-text">Commit &amp; move right</td></tr>
            <tr><td className="py-1 font-medium text-text-muted">Escape</td><td className="py-1 text-text">Cancel edit</td></tr>
            <tr><td className="py-1 font-medium text-text-muted">Arrow keys</td><td className="py-1 text-text">Navigate cells / Move cursor in edit mode</td></tr>
            <tr><td className="py-1 font-medium text-text-muted">Shift + Arrow</td><td className="py-1 text-text">Extend selection range</td></tr>
            <tr><td className="py-1 font-medium text-text-muted">Ctrl + Z / Y</td><td className="py-1 text-text">Undo / Redo</td></tr>
            <tr><td className="py-1 font-medium text-text-muted">Ctrl + C / V</td><td className="py-1 text-text">Copy / Paste</td></tr>
            <tr><td className="py-1 font-medium text-text-muted">Delete</td><td className="py-1 text-text">Clear cell content</td></tr>
          </tbody>
        </table>

        {/* Formulas */}
        <h3 className="text-xs font-semibold text-primary mb-1">Supported Formulas ({FORMULA_CATEGORIES.reduce((s, c) => s + c.fns.split(',').length, 0)}+)</h3>
        <p className="text-[10px] text-text-muted mb-2">Start with <span className="font-mono">=</span> to enter a formula. Supports cell refs (A1), ranges (A1:B5), cross-sheet refs (Sheet2!A1), arithmetic (+, -, *, /, ^, %), comparisons (&gt;, &lt;, =, &lt;&gt;), and string concatenation (&amp;).</p>

        <div className="space-y-2 mb-4">
          {FORMULA_CATEGORIES.map((cat) => (
            <div key={cat.title}>
              <span className="text-[10px] font-semibold text-text">{cat.title}: </span>
              <span className="text-[10px] text-text-muted font-mono">{cat.fns}</span>
            </div>
          ))}
        </div>

        {/* Examples */}
        <h3 className="text-xs font-semibold text-primary mb-1">Formula Examples</h3>
        <table className="w-full text-[11px] mb-4">
          <tbody className="divide-y divide-border-muted">
            <tr><td className="py-1 font-mono text-text-muted w-52">=SUM(A1:A10)</td><td className="py-1 text-text">Sum of range</td></tr>
            <tr><td className="py-1 font-mono text-text-muted">=IF(A1&gt;5, "Yes", "No")</td><td className="py-1 text-text">Conditional logic</td></tr>
            <tr><td className="py-1 font-mono text-text-muted">=VLOOKUP(A1, B1:C10, 2, FALSE)</td><td className="py-1 text-text">Vertical lookup (exact)</td></tr>
            <tr><td className="py-1 font-mono text-text-muted">=COUNTIF(A1:A20, "&gt;10")</td><td className="py-1 text-text">Count cells matching criteria</td></tr>
            <tr><td className="py-1 font-mono text-text-muted">=UPPER(LEFT(A1, 3))</td><td className="py-1 text-text">Nested text functions</td></tr>
            <tr><td className="py-1 font-mono text-text-muted">=Sheet2!B5 + A1</td><td className="py-1 text-text">Cross-sheet reference</td></tr>
            <tr><td className="py-1 font-mono text-text-muted">="Total: " &amp; SUM(A1:A5)</td><td className="py-1 text-text">String concatenation</td></tr>
          </tbody>
        </table>

        {/* Mouse */}
        <h3 className="text-xs font-semibold text-primary mb-1">Mouse Actions</h3>
        <table className="w-full text-[11px]">
          <tbody className="divide-y divide-border-muted">
            <tr><td className="py-1 font-medium text-text-muted w-40">Click row # / col header</td><td className="py-1 text-text">Select entire row / column</td></tr>
            <tr><td className="py-1 font-medium text-text-muted">Right-click row / col</td><td className="py-1 text-text">Insert, delete, cut, copy, paste</td></tr>
            <tr><td className="py-1 font-medium text-text-muted">Drag col border</td><td className="py-1 text-text">Resize column width</td></tr>
            <tr><td className="py-1 font-medium text-text-muted">Double-click sheet tab</td><td className="py-1 text-text">Rename sheet</td></tr>
            <tr><td className="py-1 font-medium text-text-muted">Right-click sheet tab</td><td className="py-1 text-text">Rename / Delete sheet</td></tr>
          </tbody>
        </table>

        <div className="mt-4 pt-3 border-t border-border-muted text-center">
          <button type="button" onClick={onClose} className="h-7 px-4 rounded border border-primary bg-primary text-[11px] font-medium text-primary-foreground hover:bg-primary-hover transition-colors">
            Got it
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
