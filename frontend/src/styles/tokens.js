/**
 * BakeryPOS Enterprise Design System Tokens
 * Clean, high-legibility, professional retail/POS tokens.
 * Zero neon gradients, high-contrast typography, crisp boundaries.
 */

export const tokens = {
  colors: {
    // Canvas & Surfaces
    canvas: '#f8fafc',          // Page background (Slate 50)
    surface: '#ffffff',         // Cards, modals, data tables (White)
    surfaceSubtle: '#f1f5f9',   // Table headers, subtle card headers (Slate 100)
    surfaceHover: '#e2e8f0',    // Interactive element hover state (Slate 200)
    surfaceActive: '#cbd5e1',   // Pressed/active state (Slate 300)

    // Borders & Dividers (Dark black in light mode for crisp retail visibility)
    border: '#090d16',          // Dark black border
    borderStrong: '#000000',    // Solid black for inputs and active boundaries
    borderFocus: '#000000',     // Active focus ring / selected card

    // Typography (High-contrast WCAG AAA compliant)
    text: {
      primary: '#020617',       // Headings, prices, labels (Slate 950)
      secondary: '#1e293b',     // Body text, table cells (Slate 800)
      muted: '#334155',         // Subtitles, helper text (Slate 700)
      disabled: '#64748b',      // Disabled states (Slate 500)
      inverse: '#ffffff',       // Text on dark backgrounds (White)
    },

    // Brand & Action
    brand: {
      primary: '#0f172a',       // Primary CTA, active nav (Slate 900)
      primaryHover: '#1e293b',  // Primary button hover (Slate 800)
      accent: '#2563eb',        // Interactive links, selection accents (Blue 600)
      accentHover: '#1d4ed8',   // Blue hover (Blue 700)
    },

    // Semantic Status Colors (Clean, non-neon, WCAG compliant)
    status: {
      success: {
        text: '#065f46',        // Emerald 800
        bg: '#ecfdf5',          // Emerald 50
        border: '#a7f3d0',      // Emerald 200
        solid: '#059669',       // Emerald 600
      },
      warning: {
        text: '#92400e',        // Amber 800
        bg: '#fffbeb',          // Amber 50
        border: '#fde68a',      // Amber 200
        solid: '#d97706',       // Amber 600
      },
      danger: {
        text: '#991b1b',        // Red 800
        bg: '#fef2f2',          // Red 50
        border: '#fecaca',      // Red 200
        solid: '#dc2626',       // Red 600
      },
      info: {
        text: '#1e40af',        // Blue 800
        bg: '#eff6ff',          // Blue 50
        border: '#bfdbfe',      // Blue 200
        solid: '#2563eb',       // Blue 600
      },
      neutral: {
        text: '#334155',        // Slate 700
        bg: '#f1f5f9',          // Slate 100
        border: '#e2e8f0',      // Slate 200
        solid: '#475569',       // Slate 600
      },
    },
  },

  // Sizing & Spacing
  spacing: {
    touchTargetMin: '44px',     // Ergonomic minimum height for cashier touch controls
  },

  // Radiuses
  radius: {
    xs: '0.25rem',              // 4px - Small badges
    sm: '0.375rem',             // 6px - Input fields, table rows
    md: '0.5rem',               // 8px - Buttons, standard cards
    lg: '0.75rem',              // 12px - Modals, outer containers
    full: '9999px',             // Pills, avatar circles
  },

  // Shadows (Crisp, subtle, no colored neon glow)
  shadows: {
    none: 'none',
    subtle: '0 1px 2px 0 rgb(0 0 0 / 0.04)',
    card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
    dropdown: '0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
    modal: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
  },

  // Typography
  typography: {
    fontFamilySans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyMono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
};

export default tokens;
