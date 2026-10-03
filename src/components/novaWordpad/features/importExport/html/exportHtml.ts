import type { Exporter } from '../common/types';

export const htmlExporter: Exporter = {
  export(canonicalHtml: string): Promise<Blob> {
    const document = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Document</title>
</head>
<body>
${canonicalHtml}
</body>
</html>
`;
    return Promise.resolve(new Blob([document], { type: 'text/html' }));
  },
};
