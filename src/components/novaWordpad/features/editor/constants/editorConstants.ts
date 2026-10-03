export const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'sup', 'sub', 'span',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'blockquote', 'pre', 'code',
  'ul', 'ol', 'li',
  'a', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'hr', 'div'
] as const;

export const ALLOWED_STYLE_PROPS = [
  'font-family',
  'font-size',
  'color',
  'background-color',
  'text-align',
  'width',
  'height'
] as const;

export const FONT_FAMILIES = [
  'Arial',
  'Calibri',
  'Times New Roman',
  'Georgia',
  'Verdana',
  'Tahoma',
  'Trebuchet MS',
  'Courier New',
  'Consolas',
  'Impact',
  'Comic Sans MS'
] as const;

export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72] as const;

export const ZOOM_LEVELS = [50, 75, 90, 100, 110, 125, 150, 175, 200] as const;

export interface HeadingOption {
  value: string;
  label: string;
}

export const HEADING_OPTIONS: HeadingOption[] = [
  { value: 'p', label: 'Normal' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
  { value: 'h5', label: 'Heading 5' },
  { value: 'h6', label: 'Heading 6' },
  { value: 'blockquote', label: 'Quote' },
  { value: 'pre', label: 'Code block' }
];

export const DEFAULT_DOCUMENT_HTML = '<p><br></p>';

export const HISTORY_MAX_STATES = 100;
export const HISTORY_DEBOUNCE_MS = 400;
export const AUTOSAVE_DEBOUNCE_MS = 500;

export const DANGEROUS_URL_PROTOCOLS = ['javascript:', 'vbscript:', 'data:text/html'] as const;
