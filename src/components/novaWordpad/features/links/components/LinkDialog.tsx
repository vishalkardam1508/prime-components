import { useState } from 'react';
import type { FormEvent } from 'react';
import { Dialog } from '../../../components/Dialog/Dialog';
import { Button } from '../../../components/Button/Button';
import type { InsertLinkPayload } from '../commands/insertLink';

export interface LinkDialogInitial {
  url: string;
  text: string;
}

export interface LinkDialogProps {
  open: boolean;
  initial?: LinkDialogInitial | null;
  onSubmit: (payload: InsertLinkPayload) => void;
  onRemove?: () => void;
  onClose?: () => void;
}

/** Insert/edit-link dialog: URL, display text, and open-in-new-window. */
export function LinkDialog({ open, initial, onSubmit, onRemove, onClose }: LinkDialogProps) {
  const [url, setUrl] = useState(initial?.url ?? '');
  const [text, setText] = useState(initial?.text ?? '');
  const [newWindow, setNewWindow] = useState(true);

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (url.trim()) onSubmit({ url, text, newWindow });
  };

  return (
    <Dialog
      open={open}
      title={initial?.url ? 'Edit Link' : 'Insert Link'}
      onClose={onClose}
      footer={
        <>
          {initial?.url && (
            <Button variant="danger" onClick={onRemove}>
              Remove Link
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => onSubmit({ url, text, newWindow })} disabled={!url.trim()}>
            {initial?.url ? 'Update' : 'Insert'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="nova-wordpad-field">
          <label htmlFor="link-url">URL</label>
          <input
            id="link-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            autoFocus
          />
        </div>
        <div className="nova-wordpad-field">
          <label htmlFor="link-text">Display text</label>
          <input id="link-text" type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Example" />
        </div>
        <label className="nova-wordpad-field-check">
          <input type="checkbox" checked={newWindow} onChange={(e) => setNewWindow(e.target.checked)} />
          Open in new window
        </label>
      </form>
    </Dialog>
  );
}
