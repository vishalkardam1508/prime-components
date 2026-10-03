import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { registerAllCommands } from './providers/registerCommands';
import { isCommandActive, getCommandCurrentValue } from '../core/commands/executeCommand';
import { useEditor } from '../features/editor/hooks/useEditor';
import { useEditorSelection } from '../features/editor/hooks/useEditorSelection';
import { useHistory } from '../features/history/hooks/useHistory';
import { Editor } from '../features/editor/components/Editor';
import { Toolbar, ToolbarGroup, ToolbarDivider } from '../components/Toolbar/Toolbar';
import { IconButton } from '../components/IconButton/IconButton';
import { StatusBar } from '../components/StatusBar/StatusBar';
import { FontFamilySelect } from '../features/formatting/components/FontFamilySelect';
import { FontSizeSelect } from '../features/formatting/components/FontSizeSelect';
import { TextColorPicker } from '../features/formatting/components/TextColorPicker';
import { HighlightPicker } from '../features/formatting/components/HighlightPicker';
import { HeadingSelect } from '../features/paragraph/components/HeadingSelect';
import { AlignButtons } from '../features/paragraph/components/AlignButtons';
import type { AlignValue } from '../features/paragraph/commands/align';
import { ListButtons } from '../features/lists/components/ListButtons';
import { LinkDialog } from '../features/links/components/LinkDialog';
import type { LinkDialogInitial } from '../features/links/components/LinkDialog';
import { getLinkAtCaret } from '../features/links/commands/insertLink';
import type { InsertLinkPayload } from '../features/links/commands/insertLink';
import { ImageDialog } from '../features/images/components/ImageDialog';
import type { InsertImagePayload } from '../features/images/commands/insertImage';
import { TableGridPicker } from '../features/tables/components/TableGridPicker';
import { createDocumentState, filenameFor } from '../features/document/services/documentState';
import type { DocumentFormat, DocumentState } from '../features/document/services/documentState';
import { saveDocument, exportDocumentAs } from '../features/document/services/documentService';
import { importFile } from '../features/importExport/common/importer';
import { getExporter } from '../features/importExport/common/exporter';
import { SUPPORTED_EXTENSIONS } from '../features/importExport/detector/formatDetector';
import type { SelectionSnapshot } from '../core/selection/saveSelection';
import { countWords, countCharacters } from '../core/serialization/textSerializer';
import { DEFAULT_DOCUMENT_HTML, FONT_SIZES } from '../features/editor/constants/editorConstants';
import '../styles/reset.css';
import '../styles/theme.css';
import './NovaWordpad.css';

registerAllCommands();

export interface NovaWordpadProps {
  /** Initial document HTML. Defaults to an empty paragraph. */
  initialHtml?: string;
  /** Extra class name(s) merged onto the root wrapper. */
  className?: string;
}

interface Counts {
  words: number;
  characters: number;
  selection: number;
}

interface LinkDialogState {
  open: boolean;
  initial: LinkDialogInitial | null;
  selection: SelectionSnapshot | null;
}

interface ImageDialogState {
  open: boolean;
  selection: SelectionSnapshot | null;
}

const EXPORT_FORMATS: { format: DocumentFormat; label: string }[] = [
  { format: 'html', label: 'HTML (.html)' },
  { format: 'markdown', label: 'Markdown (.md)' },
  { format: 'text', label: 'Plain Text (.txt)' }
];

/**
 * NovaWordpad — an embeddable rich-text editor. Renders into whatever
 * bounded-height container the consumer places it in (it never assumes
 * `100vh`/full-tab ownership); the consumer is responsible for giving its
 * wrapper an explicit height.
 */
export function NovaWordpad({ initialHtml = DEFAULT_DOCUMENT_HTML, className }: NovaWordpadProps) {
  const editorApi = useEditor(initialHtml, useHistory);
  const { version: selectionVersion } = useEditorSelection(editorApi.rootRef);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [docState, setDocState] = useState<DocumentState>(() => createDocumentState());
  const [counts, setCounts] = useState<Counts>({ words: 0, characters: 0, selection: 0 });
  const [linkDialog, setLinkDialog] = useState<LinkDialogState>({ open: false, initial: null, selection: null });
  const [imageDialog, setImageDialog] = useState<ImageDialogState>({ open: false, selection: null });
  const [tablePickerOpen, setTablePickerOpen] = useState(false);
  const [fileMenuOpen, setFileMenuOpen] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const fileMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!fileMenuOpen) return;
    const onDocClick = (e: MouseEvent): void => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) setFileMenuOpen(false);
    };
    const onEsc = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setFileMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [fileMenuOpen]);

  const ctx = useMemo(
    () => ({ editorService: editorApi.editorService, selectionService: editorApi.selectionService, history: editorApi.history }),
    [editorApi]
  );

  const refreshCounts = useCallback((): void => {
    const root = editorApi.editorService.getRoot();
    if (!root) return;
    const words = countWords(root);
    const characters = countCharacters(root, true);
    const selectionText = window.getSelection()?.toString() ?? '';
    setCounts({ words, characters, selection: selectionText.length });
  }, [editorApi]);

  useEffect(() => {
    // Syncs word/char/selection counts from the DOM whenever the native
    // `selectionchange` event fires (tracked externally by
    // `useEditorSelection`'s version counter) — a legitimate "subscribe to
    // an external system" effect, not state derivable from props/state
    // during render, so the setState-in-effect and exhaustive-deps rules
    // are both confirmed false positives here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionVersion]);

  const markDirty = useCallback((): void => {
    setDocState((s) => (s.dirty ? s : { ...s, dirty: true }));
    refreshCounts();
  }, [refreshCounts]);

  const runCommand = useCallback(
    (id: string, payload?: unknown): void => {
      editorApi.execute(id, payload);
      markDirty();
    },
    [editorApi, markDirty]
  );

  // ---- File: New / Open / Save / Save As / Export --------------------
  const handleNew = (): void => {
    if (docState.dirty && !window.confirm('Discard unsaved changes and start a new document?')) return;
    editorApi.loadDocument(DEFAULT_DOCUMENT_HTML);
    setDocState(createDocumentState());
    refreshCounts();
  };

  const handleOpenClick = (): void => fileInputRef.current?.click();

  const handleFilesSelected = useCallback(
    async (files: FileList | File[]): Promise<void> => {
      if (files.length === 0) return;
      const file = files[0];
      try {
        setError('');
        const { html, format } = await importFile(file);
        // `importFile` throws before ever returning a 'docx' result (DOCX
        // import isn't implemented yet), so this narrows its 4-value
        // `DocumentFormat` (importExport's) down to the 3-value
        // `DocumentFormat` that `DocumentState` (document feature's) uses.
        if (format === 'docx') {
          setError('DOCX import is not available in this build yet.');
          return;
        }
        editorApi.loadDocument(html);
        const title = file.name.replace(/\.[^.]+$/, '');
        setDocState((s) => ({ ...s, title, format, dirty: false }));
        refreshCounts();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to open this file.');
      }
    },
    [editorApi, refreshCounts]
  );

  const handleSave = useCallback(async (): Promise<void> => {
    try {
      setError('');
      await saveDocument(docState, editorApi.editorService.getHtml(), getExporter);
      setDocState((s) => ({ ...s, dirty: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to export the document.');
    }
  }, [docState, editorApi]);

  const handleExportAs = useCallback(
    async (format: DocumentFormat): Promise<void> => {
      try {
        setError('');
        await exportDocumentAs(docState, editorApi.editorService.getHtml(), format, getExporter);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to export the document.');
      }
    },
    [docState, editorApi]
  );

  // ---- Reserved shortcuts (undo/redo/save/select all) -----------------
  const handleReserved = (action: string): void => {
    if (action === 'undo') editorApi.history.undo();
    else if (action === 'redo') editorApi.history.redo();
    else if (action === 'selectAll') editorApi.selectionService.selectAll();
    else if (action === 'save') void handleSave();
    refreshCounts();
  };

  // ---- Link dialog --------------------------------------------------------
  // Selection is captured at the moment the toolbar button is pressed —
  // before the dialog's focus trap moves focus away from the editor —
  // then restored immediately before the command runs.
  const openLinkDialog = (): void => {
    const initial = getLinkAtCaret(editorApi.editorService.getRoot(), editorApi.selectionService);
    const selection = editorApi.selectionService.save();
    setLinkDialog({ open: true, initial, selection });
  };

  const submitLink = (payload: InsertLinkPayload): void => {
    if (linkDialog.selection) editorApi.selectionService.restore(linkDialog.selection);
    runCommand('insertLink', payload);
    setLinkDialog({ open: false, initial: null, selection: null });
  };

  const removeLinkAndClose = (): void => {
    if (linkDialog.selection) editorApi.selectionService.restore(linkDialog.selection);
    runCommand('removeLink');
    setLinkDialog({ open: false, initial: null, selection: null });
  };

  // ---- Image dialog ---------------------------------------------------
  const openImageDialog = (): void => {
    const selection = editorApi.selectionService.save();
    setImageDialog({ open: true, selection });
  };

  const submitImage = (payload: InsertImagePayload): void => {
    if (imageDialog.selection) editorApi.selectionService.restore(imageDialog.selection);
    runCommand('insertImage', payload);
    setImageDialog({ open: false, selection: null });
  };

  // ---- Toolbar active-state helpers -------------------------------------
  const isActive = (id: string): boolean => isCommandActive(id, ctx);
  const currentValue = <T,>(id: string, fallback: T): T => getCommandCurrentValue(id, ctx, fallback);

  const handleInputFilesChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files && e.target.files.length > 0) void handleFilesSelected(e.target.files);
  };

  return (
    <div
      className={className ? `nova-wordpad-root nova-wordpad-shell ${className}` : 'nova-wordpad-root nova-wordpad-shell'}
      data-theme={theme}
    >
      <header className="nova-wordpad-titlebar">
        <input
          className="nova-wordpad-titlebar__title"
          value={docState.title}
          onChange={(e) => setDocState((s) => ({ ...s, title: e.target.value, dirty: true }))}
          aria-label="Document title"
        />
        <span className="nova-wordpad-titlebar__meta">
          {filenameFor(docState)}
          {docState.dirty ? ' • unsaved' : ''}
        </span>
        <button
          type="button"
          className="nova-wordpad-titlebar__theme-toggle"
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        >
          {theme === 'dark' ? (
            <svg viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3" />
              <path
                d="M8 1.5v1.5M8 13v1.5M14.5 8H13M3 8H1.5M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1M12.6 12.6l-1.1-1.1M4.5 4.5 3.4 3.4"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" fill="none">
              <path
                d="M13.5 9.3A5.8 5.8 0 1 1 6.7 2.5a4.6 4.6 0 0 0 6.8 6.8Z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          )}
        </button>
      </header>

      <Toolbar>
        <ToolbarGroup label="File">
          <div className="nova-wordpad-file-menu" ref={fileMenuRef}>
            <button
              type="button"
              className="nova-wordpad-file-menu__trigger"
              aria-haspopup="menu"
              aria-expanded={fileMenuOpen}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setFileMenuOpen((v) => !v)}
            >
              File
              <span aria-hidden="true">▾</span>
            </button>
            {fileMenuOpen && (
              <ul className="nova-wordpad-menu-popover" role="menu">
                <li>
                  <button type="button" role="menuitem" onClick={() => { setFileMenuOpen(false); handleNew(); }}>
                    New
                    <span className="nova-wordpad-menu-popover__shortcut">Ctrl+N</span>
                  </button>
                </li>
                <li>
                  <button type="button" role="menuitem" onClick={() => { setFileMenuOpen(false); handleOpenClick(); }}>
                    Open…
                    <span className="nova-wordpad-menu-popover__shortcut">Ctrl+O</span>
                  </button>
                </li>
                <li>
                  <button type="button" role="menuitem" onClick={() => { setFileMenuOpen(false); void handleSave(); }}>
                    Save
                    <span className="nova-wordpad-menu-popover__shortcut">Ctrl+S</span>
                  </button>
                </li>
                <div className="nova-wordpad-menu-divider" />
                {EXPORT_FORMATS.map(({ format, label }) => (
                  <li key={format}>
                    <button type="button" role="menuitem" onClick={() => { setFileMenuOpen(false); void handleExportAs(format); }}>
                      Save As {label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={SUPPORTED_EXTENSIONS.join(',')}
            style={{ display: 'none' }}
            onChange={handleInputFilesChange}
          />
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup label="Undo/Redo">
          <IconButton
            label="Undo"
            shortcut="Ctrl+Z"
            disabled={!editorApi.history.canUndo}
            onClick={() => handleReserved('undo')}
          >
            <svg viewBox="0 0 16 16" fill="none">
              <path
                d="M5 4 2 7l3 3M2 7h7a4 4 0 1 1 0 8h-1"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </IconButton>
          <IconButton
            label="Redo"
            shortcut="Ctrl+Y"
            disabled={!editorApi.history.canRedo}
            onClick={() => handleReserved('redo')}
          >
            <svg viewBox="0 0 16 16" fill="none">
              <path
                d="M11 4l3 3-3 3M14 7H7a4 4 0 1 0 0 8h1"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </IconButton>
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup label="Paragraph Style">
          <HeadingSelect value={currentValue<string>('heading', 'p')} onChange={(v) => runCommand('heading', v)} />
        </ToolbarGroup>

        <ToolbarGroup label="Font">
          <FontFamilySelect value={currentValue<string>('fontFamily', 'Arial')} onChange={(v) => runCommand('fontFamily', v)} />
          <FontSizeSelect value={currentValue<number>('fontSize', FONT_SIZES[4])} onChange={(v) => runCommand('fontSize', v)} />
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup label="Text Formatting">
          <IconButton label="Bold" shortcut="Ctrl+B" active={isActive('bold')} onClick={() => runCommand('bold')}>
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M4 2h4.5a2.5 2.5 0 0 1 0 5H4zM4 7h5a2.5 2.5 0 0 1 0 5H4z" stroke="currentColor" strokeWidth="1.3" fill="none" />
            </svg>
          </IconButton>
          <IconButton label="Italic" shortcut="Ctrl+I" active={isActive('italic')} onClick={() => runCommand('italic')}>
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M7 2h4M5 14h4M9.5 2 6.5 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </IconButton>
          <IconButton label="Underline" shortcut="Ctrl+U" active={isActive('underline')} onClick={() => runCommand('underline')}>
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M4 2v5.5a4 4 0 0 0 8 0V2M3 14h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
            </svg>
          </IconButton>
          <IconButton label="Strikethrough" active={isActive('strike')} onClick={() => runCommand('strike')}>
            <svg viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8h10M5 4.5c0-1 1.2-2 3-2s3 .8 3 2M5 11.5c0 1 1.2 2 3 2s3-.9 3-2"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </IconButton>
          <IconButton label="Superscript" active={isActive('superscript')} onClick={() => runCommand('superscript')}>
            <svg viewBox="0 0 16 16" fill="none">
              <text x="1" y="14" fontSize="10" fill="currentColor">
                x
              </text>
              <text x="9" y="6" fontSize="6" fill="currentColor">
                2
              </text>
            </svg>
          </IconButton>
          <IconButton label="Subscript" active={isActive('subscript')} onClick={() => runCommand('subscript')}>
            <svg viewBox="0 0 16 16" fill="none">
              <text x="1" y="11" fontSize="10" fill="currentColor">
                x
              </text>
              <text x="9" y="15" fontSize="6" fill="currentColor">
                2
              </text>
            </svg>
          </IconButton>
          <TextColorPicker onSelect={(c) => runCommand('textColor', c)} />
          <HighlightPicker onSelect={(c) => runCommand('highlight', c)} />
          <IconButton label="Clear Formatting" onClick={() => runCommand('clearFormatting')}>
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M3 2h7l-3 12" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <path d="M2 14 14 2" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </IconButton>
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup label="Alignment">
          <AlignButtons value={currentValue<AlignValue>('align', 'left')} onChange={(v) => runCommand('align', v)} />
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup label="Lists">
          <ListButtons
            bulletActive={isActive('bulletList')}
            numberedActive={isActive('numberedList')}
            onBullet={() => runCommand('bulletList')}
            onNumbered={() => runCommand('numberedList')}
            onIndent={() => runCommand('indent')}
            onOutdent={() => runCommand('outdent')}
          />
        </ToolbarGroup>

        <ToolbarDivider />

        <ToolbarGroup label="Insert">
          <IconButton label="Link" shortcut="Ctrl+K" onClick={openLinkDialog}>
            <svg viewBox="0 0 16 16" fill="none">
              <path
                d="M6.5 9.5 9.5 6.5M6 4 4.5 5.5a3 3 0 0 0 4 4.5L10 8.5M10 12l1.5-1.5a3 3 0 0 0-4-4.5L6 7.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </IconButton>
          <IconButton label="Image" onClick={openImageDialog}>
            <svg viewBox="0 0 16 16" fill="none">
              <rect x="2" y="3" width="12" height="10" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <circle cx="5.5" cy="6.5" r="1" fill="currentColor" />
              <path d="M3 12l3.5-4 3 3 2-2.5L14 12" stroke="currentColor" strokeWidth="1.2" fill="none" />
            </svg>
          </IconButton>
          <div style={{ position: 'relative' }}>
            <IconButton label="Table" onClick={() => setTablePickerOpen((v) => !v)}>
              <svg viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" stroke="currentColor" strokeWidth="1.2" />
                <path d="M2 6h12M2 10h12M6 2v12M10 2v12" stroke="currentColor" strokeWidth="1" />
              </svg>
            </IconButton>
            {tablePickerOpen && (
              <TableGridPicker
                onSelect={({ rows, cols }) => runCommand('insertTable', { rows, cols })}
                onClose={() => setTablePickerOpen(false)}
              />
            )}
          </div>
          <IconButton label="Horizontal Rule" onClick={() => runCommand('horizontalRule')}>
            <svg viewBox="0 0 16 16" fill="none">
              <path d="M2 8h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </IconButton>
        </ToolbarGroup>
      </Toolbar>

      {error !== '' && (
        <div className="nova-wordpad-error" role="alert">
          {error}
          <button type="button" onClick={() => setError('')} aria-label="Dismiss error">
            ✕
          </button>
        </div>
      )}

      <Editor
        editorApi={editorApi}
        initialHtml={initialHtml}
        zoom={docState.zoom}
        onShortcut={runCommand}
        onChange={markDirty}
        onReserved={handleReserved}
        onSelectionChange={refreshCounts}
        onImportFiles={(files) => {
          void handleFilesSelected(files);
        }}
      />

      <StatusBar
        words={counts.words}
        characters={counts.characters}
        selectionLength={counts.selection}
        zoom={docState.zoom}
        onZoomChange={(z) => setDocState((s) => ({ ...s, zoom: Number(z) }))}
      />

      <LinkDialog
        open={linkDialog.open}
        initial={linkDialog.initial}
        onSubmit={submitLink}
        onRemove={removeLinkAndClose}
        onClose={() => setLinkDialog({ open: false, initial: null, selection: null })}
      />

      <ImageDialog
        open={imageDialog.open}
        onSubmit={submitImage}
        onClose={() => setImageDialog({ open: false, selection: null })}
      />
    </div>
  );
}
