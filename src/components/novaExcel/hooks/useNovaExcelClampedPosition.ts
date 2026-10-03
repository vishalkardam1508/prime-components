import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Positions a `fixed` popup at (x, y) but flips it above/left when it would
 * otherwise overflow the viewport — e.g. a context menu opened near the
 * bottom or right edge of the screen (like the sheet tabs footer).
 */
export function useNovaExcelClampedPosition(x: number, y: number): {
  ref: React.RefObject<HTMLDivElement | null>;
  style: { top: number; left: number };
} {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ top: y, left: x });

  useLayoutEffect(() => {
    const el = ref.current;
    if (el == null) { setPos({ top: y, left: x }); return; }

    const rect = el.getBoundingClientRect();
    const margin = 8;

    let top = y;
    if (top + rect.height > window.innerHeight - margin) {
      top = Math.max(margin, y - rect.height);
    }

    let left = x;
    if (left + rect.width > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - rect.width - margin);
    }

    setPos({ top, left });
  }, [x, y]);

  return { ref, style: pos };
}
