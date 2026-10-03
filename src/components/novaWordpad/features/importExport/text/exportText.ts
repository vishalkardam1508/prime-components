import type { Exporter } from '../common/types';
import { htmlToText } from '../../../core/serialization/textSerializer';

export const textExporter: Exporter = {
  export(canonicalHtml: string): Promise<Blob> {
    const doc = new DOMParser().parseFromString(canonicalHtml, 'text/html');
    const text = htmlToText(doc.body);
    return Promise.resolve(new Blob([text], { type: 'text/plain' }));
  },
};
