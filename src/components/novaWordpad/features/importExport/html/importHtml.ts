import type { Importer } from '../common/types';
import { normalizeHtmlString } from '../../editor/utils/normalizeHtml';

export const htmlImporter: Importer = {
  async import(file: File): Promise<string> {
    const raw = await file.text();
    const doc = new DOMParser().parseFromString(raw, 'text/html');
    const bodyHtml = doc.body.innerHTML;
    return normalizeHtmlString(bodyHtml);
  },
};
