/**
 * Strict Monochrome Black & White Design Engineering Tokens
 * Defined in: 00-SYSTEMS/Design Standards/Monochrome Black and White UI Standard.md
 * Enforces Rule 16 of Forbidden Anti-Patterns (Zero Unsolicited Cyan / Pure Monochrome)
 */

export const MONOCHROME_THEME = {
  header: {
    height: '52px',
    boxSizing: 'border-box' as const,
  },
  sidebar: {
    width: '240px',
  },
  typography: {
    fontSans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontMono: "'JetBrains Mono', 'Fira Code', monospace",
    letterSpacing: '0px',
    weights: {
      regular: 400,
      medium: 500,
    },
  },
  palette: {
    light: {
      bg: '#FFFFFF',
      surface: '#FFFFFF',
      surfaceHover: '#F4F4F5',
      surfaceActive: '#E4E4E7',
      card: '#FFFFFF',
      border: '#E4E4E7',
      borderSubtle: '#F4F4F5',
      textPrimary: '#09090B',
      textSecondary: '#52525B',
      textMuted: '#A1A1AA',
      
      // Strict Monochrome Primary (Black button with White text)
      primary: '#09090B',
      primaryHover: '#27272A',
      primaryText: '#FFFFFF',
      accent: '#18181B',

      // Monochrome Code / Command Containers (Zero Pitch-Black Hole)
      terminalBg: '#F4F4F5',
      terminalBorder: '#E4E4E7',
      terminalText: '#09090B',

      // Soft Tint Status Pills
      successBg: '#F4F4F5',
      successText: '#09090B',
      warningBg: '#F4F4F5',
      warningText: '#52525B',
      dangerBg: '#F4F4F5',
      dangerText: '#09090B',
      infoBg: '#F4F4F5',
      infoText: '#09090B',
    },
    dark: {
      bg: '#09090B',
      surface: '#121214',
      surfaceHover: '#18181B',
      surfaceActive: '#27272A',
      card: '#121214',
      border: '#27272A',
      borderSubtle: '#1F1F23',
      textPrimary: '#F4F4F5',
      textSecondary: '#A1A1AA',
      textMuted: '#71717A',

      // Strict Monochrome Primary (White button with Black text)
      primary: '#FFFFFF',
      primaryHover: '#E4E4E7',
      primaryText: '#09090B',
      accent: '#F4F4F5',

      // Monochrome Code / Command Containers
      terminalBg: '#18181B',
      terminalBorder: '#27272A',
      terminalText: '#F4F4F5',

      // Soft Tint Status Pills
      successBg: '#18181B',
      successText: '#F4F4F5',
      warningBg: '#18181B',
      warningText: '#A1A1AA',
      dangerBg: '#18181B',
      dangerText: '#F4F4F5',
      infoBg: '#18181B',
      infoText: '#F4F4F5',
    },
  },
  radii: {
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '10px',
    full: '9999px',
  },
  animation: {
    fast: '0.15s cubic-bezier(0.16, 1, 0.3, 1)',
    cornerSweepDuration: '380ms',
    cornerSweepEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};
