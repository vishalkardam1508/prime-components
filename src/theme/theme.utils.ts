import type { TenantTheme, ThemeName } from './theme.types';
import { fontFamilies, fontWeights } from './typography';
import { borderRadius, borderWidth } from './borders';

const sharedRadius = {
  none: borderRadius.none.css,
  sm:   borderRadius.sm.css,
  md:   borderRadius.md.css,
  lg:   borderRadius.lg.css,
  xl:   borderRadius.xl.css,
  full: borderRadius.full.css,
};

const sharedBorderWidth = {
  none: borderWidth.none.css,
  sm:   borderWidth.sm.css,
  md:   borderWidth.md.css,
  lg:   borderWidth.lg.css,
};

const poppinsFont = {
  familyPrimary:  fontFamilies.primary,
  familyMono:     fontFamilies.mono,
  sizeBase:       '1rem',
  weightLight:    String(fontWeights.light),
  weightNormal:   String(fontWeights.regular),
  weightMedium:   String(fontWeights.medium),
  weightSemibold: String(fontWeights.semiBold),
  weightBold:     String(fontWeights.bold),
  weightExtraBold:String(fontWeights.extraBold),
};

export const THEMES: Record<ThemeName, TenantTheme> = {
  // ─────────────────────────────────────────────
  // eqas — Default brand theme
  // Primary palette: Green (#00A457)
  // Neutral palette: Green-tinted grey
  // Status: Red / Amber / Green from brand palette
  // ─────────────────────────────────────────────
  eqas: {
    colors: {
      /* Background — Neutral 50 / 100 */
      background: '#F5F7F5',
      backgroundSubtle: '#E6EAE7',

      /* Surface */
      surface: '#FFFFFF',
      surfaceMuted: '#EBFAF2',       // Green 50 — brand tint for table headers / subtle areas
      surfaceHover: '#E6EAE7',       // Neutral 100
      surfaceElevated: '#FFFFFF',
      surfaceActive: '#CDD4CE',      // Neutral 200
      surfaceDisabled: '#f1f1f1',    // Neutral 50

      /* Text — Neutral 900 → 300 */
      text: '#141A14',               // Neutral 900
      textMuted: '#546757',          // Neutral 600
      textSubtle: '#798F7C',         // Neutral 400
      textInverted: '#FFFFFF',
      textDisabled: '#1d1d1d',       // Neutral 300

      /* Border — Neutral scale */
      border: '#CDD4CE',             // Neutral 200
      borderMuted: '#E6EAE7',        // Neutral 100
      borderFocus: '#00A457',        // Green 400 (primary)
      borderDanger: '#F03526',       // Red 400
      borderStrong: '#394839',       // Neutral 700 — selected rows, active cards
      borderInfo: '#3B77BC',         // Blue 400 — informational / interactive
      borderInverse: '#141A14',      // Neutral 900 — on-dark surfaces

      /* Primary — Green brand */
      primary: '#00A457',            // Green 400
      primaryHover: '#007A3F',       // Green 600
      primaryActive: '#005629',      // Green 700
      primarySubtle: '#EBFAF2',      // Green 50
      primaryForeground: '#FFFFFF',
      primaryBorder: '#C4EED8',

      /* Status — Success (green) */
      success: '#00A457',            // Green 400
      successForeground: '#FFFFFF',
      successSubtle: '#EBFAF2',      // Green 50

      /* Status — Warning (amber) */
      warning: '#F59200',            // Amber 400
      warningForeground: '#141A14',  // Neutral 900 — dark text on amber bg
      warningSubtle: '#FFF7E6',      // Amber 50
      warningText: '#92400E',        // Amber 800 — readable text on amber subtle bg

      /* Status — Error (red) */
      error: '#F03526',              // Red 400
      errorForeground: '#FFFFFF',
      errorSubtle: '#FFF0ED',        // Red 50

      info: '#1A5499',
      infoForeground: '#FFFFFF',
      infoSubtle: '#E8EFF8',
      infoBorder: '#BDD0EC',

      label: '#374151',
      skeletonBg: '#E6EAE7',
    },

    font: poppinsFont,

    radius: sharedRadius,
    borderWidth: sharedBorderWidth,

    shadow: {
      sm: '0 1px 2px rgba(0, 164, 87, 0.10)',
      md: '0 4px 6px rgba(0, 164, 87, 0.15)',
      lg: '0 10px 15px rgba(0, 164, 87, 0.20)',
    },
  },

  light: {
    colors: {
      background: '#f9fafb',
      backgroundSubtle: '#f1f5f9',

      surface: '#ffffff',
      surfaceMuted: '#e0f2fe',
      surfaceHover: '#f1f5f9',
      surfaceElevated: '#ffffff',
      surfaceActive: '#e5e7eb',
      surfaceDisabled: '#f8fafc',

      text: '#0f172a',
      textMuted: '#475569',
      textSubtle: '#64748b',
      textInverted: '#ffffff',
      textDisabled: '#94a3b8',

      border: '#bae6fd',
      borderMuted: '#e2e8f0',
      borderFocus: '#2563eb',
      borderDanger: '#dc2626',
      borderStrong: '#0f172a',
      borderInfo: '#2563eb',
      borderInverse: '#0f172a',

      primary: '#2563eb',
      primaryHover: '#1d4ed8',
      primaryActive: '#1e40af',
      primarySubtle: '#dbeafe',
      primaryForeground: '#ffffff',
      primaryBorder: '#bfdbfe',

      success: '#16a34a',
      successForeground: '#ffffff',
      successSubtle: '#dcfce7',

      warning: '#f59e0b',
      warningForeground: '#0f172a',
      warningSubtle: '#fef3c7',
      warningText: '#92400e',

      error: '#dc2626',
      errorForeground: '#ffffff',
      errorSubtle: '#fee2e2',

      info: '#2563eb',
      infoForeground: '#ffffff',
      infoSubtle: '#dbeafe',
      infoBorder: '#bfdbfe',

      label: '#374151',
      skeletonBg: '#e5e7eb',
    },

    font: poppinsFont,

    radius: sharedRadius,
    borderWidth: sharedBorderWidth,

    shadow: {
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      md: '0 4px 6px rgba(0,0,0,0.1)',
      lg: '0 10px 15px rgba(0,0,0,0.15)',
    },
  },

  dark: {
    colors: {
      /* Background */
      background: '#020617',
      backgroundSubtle: '#020617',

      /* Surface */
      surface: '#0f172a',
      surfaceMuted: '#1e293b',
      surfaceHover: '#334155',
      surfaceElevated: '#020617',
      surfaceActive: '#475569',
      surfaceDisabled: '#020617',

      /* Text */
      text: '#f8fafc',
      textMuted: '#94a3b8',
      textSubtle: '#64748b',
      textInverted: '#020617',
      textDisabled: '#ffffff',

      /* Border */
      border: '#334155',
      borderMuted: '#1e293b',
      borderFocus: '#6366f1',
      borderDanger: '#ef4444',
      borderStrong: '#f8fafc',
      borderInfo: '#6366f1',
      borderInverse: '#f8fafc',

      /* Primary */
      primary: '#6366f1',
      primaryHover: '#818cf8',
      primaryActive: '#4f46e5',
      primarySubtle: '#1e1b4b',
      primaryForeground: '#020617',
      primaryBorder: '#312e81',

      /* Status */
      success: '#22c55e',
      successForeground: '#020617',
      successSubtle: '#052e16',

      warning: '#facc15',
      warningForeground: '#020617',
      warningSubtle: '#422006',
      warningText: '#fde68a',

      error: '#ef4444',
      errorForeground: '#020617',
      errorSubtle: '#450a0a',

      info: '#6366f1',
      infoForeground: '#020617',
      infoSubtle: '#1e1b4b',
      infoBorder: '#312e81',

      label: '#94a3b8',
      skeletonBg: '#121b31',
    },

    font: poppinsFont,

    radius: sharedRadius,
    borderWidth: sharedBorderWidth,

    shadow: {
      sm: '0 1px 2px rgba(0,0,0,0.6)',
      md: '0 4px 6px rgba(0,0,0,0.7)',
      lg: '0 10px 15px rgba(0,0,0,0.8)',
    },
  },

  blue: {
    colors: {
      background: '#f0f9ff',
      backgroundSubtle: '#e0f2fe',

      surface: '#ffffff',
      surfaceMuted: '#e0f2fe',
      surfaceHover: '#bae6fd',
      surfaceElevated: '#ffffff',
      surfaceActive: '#7dd3fc',
      surfaceDisabled: '#f0f9ff',

      text: '#0f172a',
      textMuted: '#475569',
      textSubtle: '#64748b',
      textInverted: '#ffffff',
      textDisabled: '#94a3b8',

      border: '#bae6fd',
      borderMuted: '#e0f2fe',
      borderFocus: '#0284c7',
      borderDanger: '#dc2626',
      borderStrong: '#0f172a',
      borderInfo: '#0284c7',
      borderInverse: '#0f172a',

      primary: '#0284c7',
      primaryHover: '#0369a1',
      primaryActive: '#075985',
      primarySubtle: '#bae6fd',
      primaryForeground: '#ffffff',
      primaryBorder: '#7dd3fc',

      success: '#16a34a',
      successForeground: '#ffffff',
      successSubtle: '#dcfce7',

      warning: '#f59e0b',
      warningForeground: '#0f172a',
      warningSubtle: '#fef3c7',
      warningText: '#92400e',

      error: '#dc2626',
      errorForeground: '#ffffff',
      errorSubtle: '#fee2e2',

      info: '#0284c7',
      infoForeground: '#ffffff',
      infoSubtle: '#e0f2fe',
      infoBorder: '#bae6fd',

      label: '#374151',
      skeletonBg: '#e0f2fe',
    },

    font: poppinsFont,

    radius: sharedRadius,
    borderWidth: sharedBorderWidth,

    shadow: {
      sm: '0 1px 2px rgba(2,132,199,0.15)',
      md: '0 4px 6px rgba(2,132,199,0.25)',
      lg: '0 10px 15px rgba(2,132,199,0.35)',
    },
  },

  green: {
    colors: {
      background: '#f0fdf4',
      backgroundSubtle: '#dcfce7',

      surface: '#ffffff',
      surfaceMuted: '#dcfce7',
      surfaceHover: '#bbf7d0',
      surfaceElevated: '#ffffff',
      surfaceActive: '#86efac',
      surfaceDisabled: '#f0fdf4',

      text: '#052e16',
      textMuted: '#166534',
      textSubtle: '#15803d',
      textInverted: '#ffffff',
      textDisabled: '#86efac',

      border: '#bbf7d0',
      borderMuted: '#dcfce7',
      borderFocus: '#16a34a',
      borderDanger: '#dc2626',
      borderStrong: '#052e16',
      borderInfo: '#16a34a',
      borderInverse: '#052e16',

      primary: '#16a34a',
      primaryHover: '#15803d',
      primaryActive: '#166534',
      primarySubtle: '#bbf7d0',
      primaryForeground: '#ffffff',
      primaryBorder: '#86efac',

      success: '#16a34a',
      successForeground: '#ffffff',
      successSubtle: '#dcfce7',

      warning: '#f59e0b',
      warningForeground: '#052e16',
      warningSubtle: '#fef3c7',
      warningText: '#92400e',

      error: '#dc2626',
      errorForeground: '#ffffff',
      errorSubtle: '#fee2e2',

      info: '#16a34a',
      infoForeground: '#ffffff',
      infoSubtle: '#dcfce7',
      infoBorder: '#bbf7d0',

      label: '#374151',
      skeletonBg: '#dcfce7',
    },

    font: poppinsFont,

    radius: sharedRadius,
    borderWidth: sharedBorderWidth,

    shadow: {
      sm: '0 1px 2px rgba(22,163,74,0.15)',
      md: '0 4px 6px rgba(22,163,74,0.25)',
      lg: '0 10px 15px rgba(22,163,74,0.35)',
    },
  },

  // ─────────────────────────────────────────────
  // neon — Dark theme, white text, neon glow shadows
  // Primary palette: Cyan (#22D3EE)
  // Status accents: neon green / amber / pink
  // ─────────────────────────────────────────────
  neon: {
    colors: {
      /* Background */
      background: '#05050a',
      backgroundSubtle: '#0a0a12',

      /* Surface */
      surface: '#0d0d16',
      surfaceMuted: '#13131f',
      surfaceHover: '#1a1a2b',
      surfaceElevated: '#0a0a12',
      surfaceActive: '#232338',
      surfaceDisabled: '#0a0a12',

      /* Text — white / cool grey */
      text: '#ffffff',
      textMuted: '#a1a1c2',
      textSubtle: '#7d7da0',
      textInverted: '#05050a',
      textDisabled: '#55556f',

      /* Border */
      border: 'rgba(255,255,255,0.12)',
      borderMuted: 'rgba(255,255,255,0.08)',
      borderFocus: '#22d3ee',
      borderDanger: '#ff3860',
      borderStrong: '#ffffff',
      borderInfo: '#22d3ee',
      borderInverse: '#05050a',

      /* Primary — neon cyan */
      primary: '#22d3ee',
      primaryHover: '#67e8f9',
      primaryActive: '#06b6d4',
      primarySubtle: 'rgba(34,211,238,0.12)',
      primaryForeground: '#05050a',
      primaryBorder: 'rgba(34,211,238,0.4)',

      /* Status — neon green */
      success: '#39ff88',
      successForeground: '#05050a',
      successSubtle: 'rgba(57,255,136,0.12)',

      /* Status — neon amber */
      warning: '#ffd23f',
      warningForeground: '#05050a',
      warningSubtle: 'rgba(255,210,63,0.12)',
      warningText: '#ffe27a',

      /* Status — neon pink/red */
      error: '#ff3860',
      errorForeground: '#05050a',
      errorSubtle: 'rgba(255,56,96,0.12)',

      /* Info — neon purple */
      info: '#a855f7',
      infoForeground: '#05050a',
      infoSubtle: 'rgba(168,85,247,0.12)',
      infoBorder: 'rgba(168,85,247,0.4)',

      label: '#a1a1c2',
      skeletonBg: '#13131f',
    },

    font: poppinsFont,

    radius: sharedRadius,
    borderWidth: sharedBorderWidth,

    /* Neon glow shadows — every shadow-sm/md/lg in the app picks these up */
    shadow: {
      sm: '0 0 8px rgba(34,211,238,0.35)',
      md: '0 0 20px rgba(34,211,238,0.45), 0 0 4px rgba(34,211,238,0.6)',
      lg: '0 0 40px rgba(34,211,238,0.55), 0 0 8px rgba(34,211,238,0.75)',
    },
  },
};
