import { useState, type JSX } from 'react';
import { ClipboardDocumentIcon, CheckIcon } from '@/icons';

interface CodeViewerProps {
  code: string;
  language?: string;
}

const TOKEN_REGEX =
  /(\/\/[^\n]*)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|\b(import|from|export|default|const|let|function|return|interface|type|extends|new|void|true|false|null|undefined|as)\b|(<\/?[A-Za-z][\w.]*)|\b(\d+(?:\.\d+)?)\b/g;

function highlight(code: string): JSX.Element[] {
  const nodes: JSX.Element[] = [];
  let lastIndex = 0;
  let key = 0;
  TOKEN_REGEX.lastIndex = 0;

  let match = TOKEN_REGEX.exec(code);
  while (match !== null) {
    if (match.index > lastIndex) {
      nodes.push(<span key={key++}>{code.slice(lastIndex, match.index)}</span>);
    }
    const [full, comment, str, keyword, tag, num] = match;
    let cls = '';
    if (comment != null) cls = 'text-slate-400 italic dark:text-white/35';
    else if (str != null) cls = 'text-emerald-600 dark:text-emerald-300';
    else if (keyword != null) cls = 'text-fuchsia-600 dark:text-fuchsia-400';
    else if (tag != null) cls = 'text-cyan-600 dark:text-cyan-300';
    else if (num != null) cls = 'text-orange-600 dark:text-orange-300';
    nodes.push(<span key={key++} className={cls}>{full}</span>);
    lastIndex = match.index + full.length;
    match = TOKEN_REGEX.exec(code);
  }
  if (lastIndex < code.length) {
    nodes.push(<span key={key++}>{code.slice(lastIndex)}</span>);
  }
  return nodes;
}

export function CodeViewer({ code, language = 'tsx' }: CodeViewerProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = (): void => {
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-black/40">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100/70 px-3 py-1.5 dark:border-white/10 dark:bg-white/[0.03]">
        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-white/40">{language}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
        >
          {copied ? <CheckIcon className="h-3 w-3" /> : <ClipboardDocumentIcon className="h-3 w-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="max-h-80 overflow-auto p-3 text-[11.5px] leading-relaxed text-slate-800 dark:text-white/90">
        <code className="font-mono">{highlight(code)}</code>
      </pre>
    </div>
  );
}
