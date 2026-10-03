/**
 * Triggers a browser download for the given data using only
 * native Blob / URL / anchor APIs. No file-saver dependency.
 */
export function downloadFile(data: BlobPart | Blob, filename: string, mimeType = 'application/octet-stream'): void {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  // Give the browser a tick to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
