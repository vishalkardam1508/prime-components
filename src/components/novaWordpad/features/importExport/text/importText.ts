import type { Importer } from '../common/types';
import { escapeHtml } from '../../../core/serialization/htmlSerializer';

export const textImporter: Importer = {
  async import(file: File): Promise<string> {
    const raw = await file.text();
    const lines = raw.replace(/\r\n?/g, '\n').split('\n');
    return lines.map((line) => `<p>${escapeHtml(line) || '<br>'}</p>`).join('');
  },
};
