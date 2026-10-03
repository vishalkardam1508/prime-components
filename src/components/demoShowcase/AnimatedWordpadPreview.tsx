import { useEffect, useRef, useState, type JSX } from 'react';
import clsx from 'clsx';

interface AnimatedWordpadPreviewProps {
  className?: string;
}

const ACCENT_HEX = '#fbbf24';

interface Segment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

// A short paragraph, typed out segment-by-segment, character-by-character.
const SCRIPT: Segment[] = [
  { text: 'Nova WordPad ' },
  { text: 'is a full rich-text editor ', bold: true },
  { text: 'built from ' },
  { text: 'scratch', italic: true },
  { text: ' — no third-party editor, no Markdown lib, ' },
  { text: 'zero dependencies.', underline: true },
];

const TOOLBAR_BUTTONS = ['B', 'I', 'U', 'S'] as const;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function Divider(): JSX.Element {
  return <span className="mx-0.5 h-4 w-px shrink-0 bg-white/10" />;
}

export function AnimatedWordpadPreview({ className }: AnimatedWordpadPreviewProps): JSX.Element {
  const [completedSegments, setCompletedSegments] = useState<Segment[]>([]);
  const [currentSegment, setCurrentSegment] = useState<Segment | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [showCursor, setShowCursor] = useState(true);
  const aliveRef = useRef(true);

  useEffect(() => {
    const blink = setInterval(() => setShowCursor((v) => !v), 500);
    return () => clearInterval(blink);
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    const isAlive = (): boolean => aliveRef.current;

    async function runLoop(): Promise<void> {
      while (isAlive()) {
        setCompletedSegments([]);
        setCurrentSegment(null);
        await sleep(600);

        for (const segment of SCRIPT) {
          if (!isAlive()) return;
          if (segment.bold) setActiveButton('B');
          else if (segment.italic) setActiveButton('I');
          else if (segment.underline) setActiveButton('U');
          else setActiveButton(null);
          await sleep(150);

          for (let i = 1; i <= segment.text.length; i++) {
            if (!isAlive()) return;
            setCurrentSegment({ ...segment, text: segment.text.slice(0, i) });
            await sleep(28);
          }
          setCompletedSegments((prev) => [...prev, segment]);
          setCurrentSegment(null);
          setActiveButton(null);
          await sleep(120);
        }

        await sleep(2200);
      }
    }

    void runLoop();
    return () => { aliveRef.current = false; };
  }, []);

  const renderSegments = currentSegment != null ? [...completedSegments, currentSegment] : completedSegments;

  return (
    <div
      className={clsx('flex flex-col overflow-hidden rounded-none border border-white/10 bg-[#0a0a12] shadow-2xl select-none', className)}
      style={{ pointerEvents: 'none' }}
    >
      {/* Browser chrome */}
      <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-white/[0.03] px-3 py-2.5">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <div className="ml-2 flex-1 truncate rounded bg-white/5 px-3 py-1 text-[10px] text-white/40">
          app.componentlibrary.dev / demo / nova-wordpad
        </div>
      </div>

      {/* Title bar — matches NovaWordpad's real title bar: doc title on the left,
          theme toggle icon on the right. */}
      <div className="flex h-7 shrink-0 items-center gap-2 border-b border-white/10 bg-white/[0.02] px-3">
        <span className="text-[11px] font-semibold text-white/70">Untitled</span>
        <span className="flex-1 truncate font-mono text-[9px] text-white/30">Untitled.html</span>
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-white/30">
          <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.3" />
          <path
            d="M8 1.5v1.5M8 13v1.5M14.5 8H13M3 8H1.5M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1M12.6 12.6l-1.1-1.1M4.5 4.5 3.4 3.4"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Toolbar — mirrors NovaWordpad's real single-row compact toolbar: a File menu
          pill, paragraph/font pills, then small icon buttons, all packed into one row. */}
      <div className="flex h-[30px] shrink-0 items-center gap-1 border-b border-white/10 px-2">
        <span className="flex h-5 items-center gap-1 rounded px-1.5 text-[10px] font-medium text-white/60">
          File
          <span className="text-[8px] text-white/30">▾</span>
        </span>
        <Divider />
        <span className="h-3.5 w-3.5 text-white/30">↶</span>
        <span className="h-3.5 w-3.5 text-white/30">↷</span>
        <Divider />
        <span className="flex h-5 items-center gap-1 rounded border border-white/10 bg-white/[0.03] px-1.5 text-[9px] text-white/50">
          Normal
          <span className="text-[7px] text-white/30">▾</span>
        </span>
        <span className="flex h-5 items-center gap-1 rounded border border-white/10 bg-white/[0.03] px-1.5 text-[9px] text-white/50">
          Arial
          <span className="text-[7px] text-white/30">▾</span>
        </span>
        <span className="flex h-5 items-center gap-1 rounded border border-white/10 bg-white/[0.03] px-1.5 text-[9px] text-white/50">
          12
          <span className="text-[7px] text-white/30">▾</span>
        </span>
        <Divider />
        {TOOLBAR_BUTTONS.map((btn) => (
          <span
            key={btn}
            className="flex h-5 w-5 items-center justify-center rounded text-[9px] font-bold transition-colors"
            style={{
              backgroundColor: activeButton === btn ? `${ACCENT_HEX}33` : 'transparent',
              color: activeButton === btn ? ACCENT_HEX : 'rgba(255,255,255,0.45)',
            }}
          >
            {btn}
          </span>
        ))}
        <Divider />
        <span className="h-3.5 w-3.5 text-white/30">☰</span>
        <span className="h-3.5 w-3.5 text-white/30">▤</span>
      </div>

      {/* Document surface */}
      <div className="min-h-[220px] flex-1 bg-white/[0.02] p-6">
        <p className="text-sm leading-relaxed text-white/80">
          {renderSegments.map((seg, i) => (
            <span
              key={i}
              className={clsx(seg.bold && 'font-bold text-white', seg.italic && 'italic', seg.underline && 'underline decoration-amber-400')}
            >
              {seg.text}
            </span>
          ))}
          <span
            className="inline-block h-4 w-[2px] translate-y-0.5 bg-amber-400"
            style={{ opacity: showCursor ? 1 : 0 }}
          />
        </p>
      </div>
    </div>
  );
}
