const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];

/** Reads a File/Blob into a base64 data URL using FileReader. */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      reject(new Error('Unsupported image type.'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (): void => resolve(reader.result as string);
    reader.onerror = (): void => reject(reader.error ?? new Error('Unable to read this image.'));
    reader.readAsDataURL(file);
  });
}

export function isImageFile(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type);
}
