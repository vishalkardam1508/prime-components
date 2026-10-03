import { htmlImporter } from '../html/importHtml';
import { markdownImporter } from '../markdown/importMarkdown';
import { textImporter } from '../text/importText';
import { detectFormat } from '../detector/formatDetector';
import type { DocumentFormat } from '../detector/formatDetector';
import type { Importer } from './types';

const importers: Partial<Record<DocumentFormat, Importer>> = {
  html: htmlImporter,
  markdown: markdownImporter,
  text: textImporter,
};

export function getImporter(format: DocumentFormat): Importer | null {
  return importers[format] ?? null;
}

/** The result of a successful `importFile` call. */
export interface ImportFileResult {
  html: string;
  format: DocumentFormat;
}

/**
 * Detects a file's format and runs its importer, returning canonical
 * HTML ready for editorService.setHtml(). Throws a user-facing error
 * message on unsupported/corrupt files rather than ever silently
 * destroying the current document (spec #74).
 */
export async function importFile(file: File): Promise<ImportFileResult> {
  const format = detectFormat(file);
  if (!format) {
    throw new Error('The selected file type is not supported.');
  }
  if (format === 'docx') {
    throw new Error('DOCX import is not available in this build yet.');
  }
  const importer = getImporter(format);
  if (!importer) {
    throw new Error('The selected file type is not supported.');
  }
  try {
    const html = await importer.import(file);
    return { html, format };
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Unable to open this file.');
  }
}
