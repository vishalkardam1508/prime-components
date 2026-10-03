import { useEffect, useLayoutEffect, useRef, useState, type JSX } from 'react';
import clsx from 'clsx';
import { generateAnimatedRows, STATUS_STYLE, type AnimatedGridRow } from './animatedGridData';

type Mode = 'pagination' | 'infinite';
type Accent = 'cyan' | 'fuchsia';

interface AnimatedGridPreviewProps {
  mode: Mode;
  accent: Accent;
  className?: string;
}

const ACCENT_HEX: Record<Accent, string> = { cyan: '#22d3ee', fuchsia: '#e879f9' };
const ROW_H = 34;
const PAGE_SIZE = 7;
const POOL_SIZE = 60;
const OVERSCAN = 4;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function smoothScrollTo(el: HTMLElement, target: number, duration: number, isAlive: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    const start = el.scrollTop;
    const delta = target - start;
    if (Math.abs(delta) < 1) { resolve(); return; }
    const t0 = performance.now();
    function tick(now: number): void {
      if (!isAlive()) { resolve(); return; }
      const prog = Math.min((now - t0) / duration, 1);
      const ease = prog < 0.5 ? 2 * prog * prog : -1 + (4 - 2 * prog) * prog;
      el.scrollTop = start + delta * ease;
      if (prog < 1) requestAnimationFrame(tick);
      else resolve();
    }
    requestAnimationFrame(tick);
  });
}

export function AnimatedGridPreview({ mode, accent, className }: AnimatedGridPreviewProps): JSX.Element {
  const [rows] = useState<AnimatedGridRow[]>(() => generateAnimatedRows(POOL_SIZE));
  const [page, setPage] = useState(1);
  const [loadedCount, setLoadedCount] = useState(mode === 'infinite' ? 16 : POOL_SIZE);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [flashId, setFlashId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fading, setFading] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(320);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const aliveRef = useRef(true);

  // Track the scroll container's real height so we only ever render rows that are
  // actually inside (or just outside) the visible viewport — never the full row set.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (el == null) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry != null) setViewportHeight(entry.contentRect.height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const pageCount = Math.ceil(POOL_SIZE / PAGE_SIZE);
  const accentHex = ACCENT_HEX[accent];

  const selectRow = (id: number): void => {
    setSelectedIds((prev) => new Set(prev).add(id));
    setFlashId(id);
    setTimeout(() => setFlashId((cur) => (cur === id ? null : cur)), 500);
  };

  useEffect(() => {
    aliveRef.current = true;
    const isAlive = (): boolean => aliveRef.current;

    async function runPaginationLoop(): Promise<void> {
      while (isAlive()) {
        setPage(1);
        setSelectedIds(new Set());
        await sleep(700);
        if (!isAlive()) return;

        for (let p = 1; p <= pageCount && isAlive(); p++) {
          const pageRows = rows.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);
          const picks = [pageRows[1], pageRows[3], pageRows[5]].filter((r): r is AnimatedGridRow => r != null);
          for (const r of picks) {
            if (!isAlive()) return;
            selectRow(r.id);
            await sleep(420);
          }
          await sleep(900);
          if (!isAlive()) return;

          if (p < pageCount) {
            setFading(true);
            await sleep(200);
            setPage(p + 1);
            setSelectedIds(new Set());
            await sleep(200);
            setFading(false);
            await sleep(400);
          }
        }
        await sleep(600);
      }
    }

    async function runInfiniteLoop(): Promise<void> {
      while (isAlive()) {
        setLoadedCount(16);
        setSelectedIds(new Set());
        const el = scrollRef.current;
        if (el != null) el.scrollTop = 0;
        await sleep(700);
        if (!isAlive()) return;

        const topPicks = rows.slice(0, 16).filter((_, i) => [1, 4, 7].includes(i));
        for (const r of topPicks) {
          if (!isAlive()) return;
          selectRow(r.id);
          await sleep(420);
        }
        await sleep(500);

        let currentLoaded = 16;
        while (currentLoaded < POOL_SIZE && isAlive()) {
          const container = scrollRef.current;
          if (container == null) return;
          const target = Math.max(0, currentLoaded * ROW_H - container.clientHeight + 20);
          await smoothScrollTo(container, target, 1400, isAlive);
          if (!isAlive()) return;
          await sleep(200);

          setLoading(true);
          await sleep(1100);
          if (!isAlive()) return;
          setLoading(false);
          currentLoaded = Math.min(currentLoaded + 16, POOL_SIZE);
          setLoadedCount(currentLoaded);
          await sleep(300);

          const midRow = rows[Math.min(currentLoaded - 4, POOL_SIZE - 1)];
          if (midRow != null) selectRow(midRow.id);
          await sleep(500);
        }

        const container = scrollRef.current;
        if (container != null) {
          await smoothScrollTo(container, container.scrollHeight, 800, isAlive);
          await sleep(900);
          await smoothScrollTo(container, 0, 1800, isAlive);
        }
        await sleep(1000);
      }
    }

    void (mode === 'pagination' ? runPaginationLoop() : runInfiniteLoop());

    return () => { aliveRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const visibleRows = mode === 'pagination'
    ? rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
    : rows.slice(0, loadedCount);

  // Windowed rendering for infinite mode — only rows inside the current scroll viewport
  // (plus a small overscan buffer) ever mount, no matter how tall the preview or how many
  // rows are "loaded". Spacer rows keep the scrollbar's size/position correct.
  const startIndex = mode === 'infinite'
    ? Math.max(0, Math.floor(scrollTop / ROW_H) - OVERSCAN)
    : 0;
  const endIndex = mode === 'infinite'
    ? Math.min(visibleRows.length, Math.ceil((scrollTop + viewportHeight) / ROW_H) + OVERSCAN)
    : visibleRows.length;
  const windowedRows = mode === 'infinite' ? visibleRows.slice(startIndex, endIndex) : visibleRows;
  const topSpacer = startIndex * ROW_H;
  const bottomSpacer = (visibleRows.length - endIndex) * ROW_H;

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
          app.componentlibrary.dev / demo / {mode === 'pagination' ? 'data-grid' : 'virtual-grid'}
        </div>
      </div>

      {/* Ribbon */}
      <div className="flex shrink-0 items-center gap-3 border-b border-white/10 px-3 py-2 text-[10px] text-white/50">
        <span>Total: <b className="text-white">{POOL_SIZE}</b></span>
        <span className="h-3 w-px bg-white/15" />
        <span>Showing: <b className="text-white">{visibleRows.length}</b></span>
        <span className="h-3 w-px bg-white/15" />
        <span>Selected: <b style={{ color: accentHex }}>{selectedIds.size}</b></span>
        <span className="ml-auto rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide" style={{ borderColor: `${accentHex}55`, color: accentHex }}>
          {mode === 'pagination' ? `Page ${page} / ${pageCount}` : 'Infinite scroll'}
        </span>
      </div>

      {/* Table — capped height so the scrollbar is always visible; only rows inside the scroll viewport are rendered. */}
      <div
        ref={scrollRef}
        className="max-h-[320px] overflow-auto"
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        style={{ opacity: fading ? 0.3 : 1, transition: 'opacity 0.2s' }}
      >
        <table className="w-full min-w-[480px] border-collapse text-[11px]">
          <thead>
            <tr className="sticky top-0 z-10" style={{ background: '#12121e' }}>
              <th className="w-8 border-b border-white/10" />
              <th className="border-b border-white/10 px-2 py-2 text-left font-semibold uppercase tracking-wide text-white/40" style={{ fontSize: 9 }}>Name</th>
              <th className="border-b border-white/10 px-2 py-2 text-left font-semibold uppercase tracking-wide text-white/40" style={{ fontSize: 9 }}>Email</th>
              <th className="border-b border-white/10 px-2 py-2 text-left font-semibold uppercase tracking-wide text-white/40" style={{ fontSize: 9 }}>Dept</th>
              <th className="border-b border-white/10 px-2 py-2 text-left font-semibold uppercase tracking-wide text-white/40" style={{ fontSize: 9 }}>Status</th>
              <th className="border-b border-white/10 px-2 py-2 text-right font-semibold uppercase tracking-wide text-white/40" style={{ fontSize: 9 }}>Salary</th>
            </tr>
          </thead>
          <tbody>
            {topSpacer > 0 && (
              <tr style={{ height: topSpacer }} aria-hidden="true">
                <td colSpan={6} />
              </tr>
            )}
            {windowedRows.map((r) => {
              const selected = selectedIds.has(r.id);
              const flashing = flashId === r.id;
              return (
                <tr
                  key={r.id}
                  style={{
                    height: ROW_H,
                    backgroundColor: flashing ? `${accentHex}33` : selected ? `${accentHex}14` : 'transparent',
                    transition: 'background-color 0.5s ease-out',
                  }}
                >
                  <td className="border-b border-white/5 text-center">
                    <span
                      className="inline-block h-3 w-3 rounded-sm border"
                      style={{
                        borderColor: selected ? accentHex : 'rgba(255,255,255,0.25)',
                        backgroundColor: selected ? accentHex : 'transparent',
                        transition: 'all 0.2s',
                      }}
                    />
                  </td>
                  <td className="truncate border-b border-white/5 px-2 py-0 font-medium text-white/85">{r.name}</td>
                  <td className="truncate border-b border-white/5 px-2 py-0 text-white/50">{r.email}</td>
                  <td className="truncate border-b border-white/5 px-2 py-0 text-white/60">{r.dept}</td>
                  <td className="border-b border-white/5 px-2 py-0">
                    <span className={clsx('rounded-full px-1.5 py-0.5 text-[9px] font-semibold', STATUS_STYLE[r.status])}>{r.status}</span>
                  </td>
                  <td className="border-b border-white/5 px-2 py-0 text-right font-medium text-white/70">{r.salary}</td>
                </tr>
              );
            })}
            {bottomSpacer > 0 && (
              <tr style={{ height: bottomSpacer }} aria-hidden="true">
                <td colSpan={6} />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Loading strip (infinite mode) — height stays reserved always, only fades, so the
          card's total height never jumps as the loop toggles this on and off. */}
      {mode === 'infinite' && (
        <div className={clsx('flex h-8 shrink-0 items-center justify-center gap-2 border-t border-white/10 px-3 text-[10px] text-white/50 transition-opacity', loading ? 'opacity-100' : 'opacity-0')}>
          <span className="flex gap-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: accentHex }} />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: accentHex, animationDelay: '0.15s' }} />
            <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: accentHex, animationDelay: '0.3s' }} />
          </span>
          Loading more records…
        </div>
      )}
    </div>
  );
}
