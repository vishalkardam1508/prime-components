import { downloadFile } from '../../../core/utils/download';
import { FORMATS, filenameFor } from './documentState';
import type { DocumentFormat, DocumentState } from './documentState';

/**
 * Minimal contract a format exporter must satisfy. Mirrors the shape of
 * the exporters in the (separately ported) `features/importExport`
 * module — see `getExporter` there.
 */
export interface Exporter {
  export: (html: string) => Promise<Blob>;
}

/**
 * Resolves the exporter for a given format. Accepted as a parameter
 * (rather than imported directly from `features/importExport`) so this
 * service does not hard-depend on that sibling feature module, which is
 * being ported separately. Callers should pass `getExporter` from
 * `features/importExport/common/exporter` once it is wired in.
 */
export type ExporterResolver = (format: DocumentFormat) => Exporter | null;

/** Exports the editor's current HTML in `state.format` and triggers a download. */
export async function saveDocument(state: DocumentState, html: string, getExporter: ExporterResolver): Promise<void> {
  const exporter = getExporter(state.format);
  if (!exporter) throw new Error('Unable to export the document.');
  const blob = await exporter.export(html);
  downloadFile(blob, filenameFor(state), FORMATS[state.format]?.mime);
}

/** Exports as an explicitly chosen format without changing the active editor format. */
export async function exportDocumentAs(
  state: DocumentState,
  html: string,
  format: DocumentFormat,
  getExporter: ExporterResolver
): Promise<void> {
  const exporter = getExporter(format);
  if (!exporter) throw new Error('Unable to export the document.');
  const blob = await exporter.export(html);
  const name = `${state.title || 'Untitled'}${FORMATS[format]?.extensions[0] ?? ''}`;
  downloadFile(blob, name, FORMATS[format]?.mime);
}
