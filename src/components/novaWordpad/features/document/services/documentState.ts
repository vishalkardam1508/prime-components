import { uuid } from '../../../core/utils/uuid';

export type DocumentFormat = 'html' | 'markdown' | 'text';

export interface FormatInfo {
  extensions: string[];
  mime: string;
  label: string;
}

export const FORMATS: Record<DocumentFormat, FormatInfo> = {
  html: { extensions: ['.html', '.htm'], mime: 'text/html', label: 'HTML Document' },
  markdown: { extensions: ['.md', '.markdown'], mime: 'text/markdown', label: 'Markdown Document' },
  text: { extensions: ['.txt'], mime: 'text/plain', label: 'Text Document' }
  // docx is intentionally omitted until Phase 5 (ZIP/OOXML) lands.
};

export interface DocumentState {
  id: string;
  title: string;
  format: DocumentFormat;
  dirty: boolean;
  zoom: number;
}

export function createDocumentState(overrides: Partial<DocumentState> = {}): DocumentState {
  return {
    id: uuid(),
    title: 'Untitled',
    format: 'html',
    dirty: false,
    zoom: 100,
    ...overrides
  };
}

export function extensionForFormat(format: DocumentFormat): string {
  return FORMATS[format]?.extensions[0] ?? '.html';
}

export function filenameFor(state: Pick<DocumentState, 'title' | 'format'>): string {
  return `${state.title || 'Untitled'}${extensionForFormat(state.format)}`;
}
