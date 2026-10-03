/** The canonical set of document formats this feature knows how to detect/handle. */
export type DocumentFormat = 'html' | 'markdown' | 'text' | 'docx';

/** Formats that can actually be sniffed from raw text content (excludes binary `docx`). */
export type SniffableFormat = 'html' | 'markdown' | 'text';

const EXTENSION_MAP: Record<string, DocumentFormat> = {
  '.html': 'html',
  '.htm': 'html',
  '.md': 'markdown',
  '.markdown': 'markdown',
  '.txt': 'text',
  '.docx': 'docx',
};

const MIME_MAP: Record<string, DocumentFormat> = {
  'text/html': 'html',
  'text/markdown': 'markdown',
  'text/plain': 'text',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

/**
 * Detects a file's format using extension first, then MIME type, then a
 * light content sniff as a last resort (spec #49).
 */
export function detectFormat(file: File): DocumentFormat | null {
  const name = (file.name || '').toLowerCase();
  const ext = name.slice(name.lastIndexOf('.'));
  if (EXTENSION_MAP[ext]) return EXTENSION_MAP[ext];

  if (MIME_MAP[file.type]) return MIME_MAP[file.type];

  return null;
}

/** Content-based fallback for text already read into memory. */
export function sniffTextFormat(text: string): SniffableFormat {
  const trimmed = text.trim();
  if (trimmed.startsWith('<') && /<\/?[a-z][\s\S]*>/i.test(trimmed)) return 'html';
  if (/^#{1,6}\s|\*\*|^-\s|^\d+\.\s|\[.+\]\(.+\)/m.test(trimmed)) return 'markdown';
  return 'text';
}

export const SUPPORTED_EXTENSIONS: string[] = Object.keys(EXTENSION_MAP);
