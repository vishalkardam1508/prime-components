import { htmlExporter } from '../html/exportHtml';
import { markdownExporter } from '../markdown/exportMarkdown';
import { textExporter } from '../text/exportText';
import type { DocumentFormat } from '../detector/formatDetector';
import type { Exporter } from './types';

const exporters: Partial<Record<DocumentFormat, Exporter>> = {
  html: htmlExporter,
  markdown: markdownExporter,
  text: textExporter,
};

export function getExporter(format: DocumentFormat): Exporter | null {
  return exporters[format] ?? null;
}
