import { type JSX } from 'react';
import clsx from 'clsx';

interface Logo {
  src: string;
  alt: string;
}

const LOGOS: Logo[] = [
  { src: '/assets/images/c1.png', alt: 'DAVE' },
  { src: '/assets/images/c2.png', alt: 'Metropolis' },
  { src: '/assets/images/c3.png', alt: 'Partner' },
  { src: '/assets/images/c4.webp', alt: 'LimsXL' },
  { src: '/assets/images/c5.jpg', alt: 'Resume Tracker' },
];

// Cycled positionally across the strip so the neon glow rotates through the site's three accent colors.
const ACCENTS = [
  { border: 'border-cyan-400/30', shadow: '0 0 22px -6px rgba(34,211,238,0.55)' },
  { border: 'border-fuchsia-400/30', shadow: '0 0 22px -6px rgba(232,121,249,0.55)' },
  { border: 'border-emerald-400/30', shadow: '0 0 22px -6px rgba(52,211,153,0.55)' },
];

/**
 * An infinitely scrolling strip of partner/client logos. The track is duplicated once so the
 * looping translateX(-50%) animation lines up seamlessly with no visible seam or jump.
 *
 * The gap between cards is baked into each card's own box (fixed width + margin-right) rather
 * than a flex `gap`, so every card — including the boundary between the two duplicated halves —
 * occupies an identical pixel width. That makes -50% land exactly on one full repeat unit; with
 * a flex `gap` instead, the odd number of gaps across the doubled track doesn't split evenly at
 * the midpoint, so the loop visibly jumps/resets instead of scrolling through continuously.
 */
export function LogoMarquee(): JSX.Element {
  const track = [...LOGOS, ...LOGOS];

  return (
    <div
      className="relative overflow-hidden"
      style={{
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 3%, black 97%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, black 3%, black 97%, transparent)',
      }}
    >
      <div className="flex w-max animate-marquee items-center">
        {track.map((logo, i) => {
          const accent = ACCENTS[i % ACCENTS.length];
          return (
            <div
              key={`${logo.alt}-${i}`}
              className={clsx('mr-10 flex h-16 w-40 shrink-0 items-center justify-center rounded-lg border bg-white/95 p-3', accent?.border)}
              style={{ boxShadow: accent?.shadow }}
            >
              <img src={logo.src} alt={logo.alt} className="max-h-9 max-w-full rounded object-contain" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
