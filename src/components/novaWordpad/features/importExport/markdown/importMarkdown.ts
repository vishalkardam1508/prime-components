import { lex } from './lexer';
import { parse } from './parser';
import { render } from './renderer';
import { normalizeHtmlString } from '../../editor/utils/normalizeHtml';
import type { Importer } from '../common/types';

export const markdownImporter: Importer = {
  async import(file: File): Promise<string> {
    const source = await file.text();
    const tokens = lex(source);
    const ast = parse(tokens);
    const html = render(ast);
    return normalizeHtmlString(html);
  },
};
