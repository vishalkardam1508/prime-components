import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { Dialog } from '../../../components/Dialog/Dialog';
import { Button } from '../../../components/Button/Button';
import { fileToDataUrl, isImageFile } from '../services/imageService';
import type { InsertImagePayload } from '../commands/insertImage';
import './ImageDialog.css';

export interface ImageDialogProps {
  open: boolean;
  onSubmit: (payload: InsertImagePayload) => void;
  onClose?: () => void;
}

interface SelectedFile {
  name: string;
  dataUrl: string;
}

/** Insert-image dialog: drag-and-drop or browse a local file (with a live preview), or paste a URL. */
export function ImageDialog({ open, onSubmit, onClose }: ImageDialogProps) {
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const reset = (): void => {
    setSelectedFile(null);
    setUrl('');
    setAlt('');
    setError('');
    setDragActive(false);
  };

  const handleFile = async (file: File): Promise<void> => {
    if (!isImageFile(file)) {
      setError('That file doesn’t look like an image.');
      return;
    }
    try {
      setError('');
      const dataUrl = await fileToDataUrl(file);
      setSelectedFile({ name: file.name, dataUrl });
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to read this image.');
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file != null) void handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file != null) void handleFile(file);
  };

  const canInsert = selectedFile != null || url.trim() !== '';

  const handleInsert = (): void => {
    if (selectedFile != null) {
      onSubmit({ src: selectedFile.dataUrl, alt: alt || selectedFile.name });
    } else if (url.trim() !== '') {
      onSubmit({ src: url.trim(), alt });
    }
    reset();
  };

  const handleClose = (): void => {
    reset();
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      title="Insert Image"
      onClose={handleClose}
      width={460}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!canInsert} onClick={handleInsert}>
            Insert Image
          </Button>
        </>
      }
    >
      {selectedFile == null ? (
        <div
          className={`nova-wordpad-image-dropzone${dragActive ? ' nova-wordpad-image-dropzone--active' : ''}`}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="Upload an image"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
        >
          <svg viewBox="0 0 32 32" fill="none" className="nova-wordpad-image-dropzone__icon">
            <rect x="3" y="5" width="26" height="22" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="11" cy="13" r="2.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 22l7-7 5 5 4-4 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <p className="nova-wordpad-image-dropzone__title">
            <span>Click to upload</span> or drag and drop
          </p>
          <p className="nova-wordpad-image-dropzone__hint">PNG, JPG, GIF, WEBP, or SVG</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
            className="nova-wordpad-image-dropzone__input"
            onChange={handleFileChange}
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      ) : (
        <div className="nova-wordpad-image-preview">
          <img src={selectedFile.dataUrl} alt="" className="nova-wordpad-image-preview__thumb" />
          <div className="nova-wordpad-image-preview__meta">
            <span className="nova-wordpad-image-preview__name">{selectedFile.name}</span>
            <button type="button" className="nova-wordpad-image-preview__remove" onClick={() => setSelectedFile(null)}>
              Remove
            </button>
          </div>
        </div>
      )}

      {error !== '' && <p className="nova-wordpad-image-dropzone__error">{error}</p>}

      <div className="nova-wordpad-image-divider">
        <span>or</span>
      </div>

      <div className="nova-wordpad-field">
        <label htmlFor="img-url">Paste an image URL</label>
        <input
          id="img-url"
          type="url"
          value={url}
          disabled={selectedFile != null}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/photo.png"
        />
      </div>
      <div className="nova-wordpad-field">
        <label htmlFor="img-alt">Alt text</label>
        <input id="img-alt" type="text" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe the image" />
      </div>
    </Dialog>
  );
}
