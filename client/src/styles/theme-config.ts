export interface ThemeColors {
  background: string;
  surface: string;
  surfaceHover: string;
  surfaceActive: string;
  card: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryHover: string;
  primaryText: string;
  accent: string;
  success: string;
  successBg: string;
  successText: string;
  warning: string;
  warningBg: string;
  warningText: string;
  danger: string;
  dangerBg: string;
  dangerText: string;
  info: string;
  infoBg: string;
  infoText: string;
  terminalBg: string;
  terminalBorder: string;
}

export const lightTheme: ThemeColors = {
  background: '#F6F7F9',
  surface: '#FFFFFF',
  surfaceHover: '#F4F4F5',
  surfaceActive: '#E4E4E7',
  card: '#FFFFFF',
  border: '#E4E4E7',
  borderSubtle: '#F1F1F4',
  textPrimary: '#18181B',
  textSecondary: '#52525B',
  textMuted: '#A1A1AA',
  primary: '#0284C7',
  primaryHover: '#0369A1',
  primaryText: '#FFFFFF',
  accent: '#4F46E5',
  success: '#16A34A',
  successBg: 'rgba(22, 163, 74, 0.1)',
  successText: '#15803D',
  warning: '#D97706',
  warningBg: 'rgba(217, 119, 6, 0.1)',
  warningText: '#B45309',
  danger: '#DC2626',
  dangerBg: 'rgba(220, 38, 38, 0.1)',
  dangerText: '#B91C1C',
  info: '#0284C7',
  infoBg: 'rgba(2, 132, 199, 0.1)',
  infoText: '#0369A1',
  terminalBg: '#18181B',
  terminalBorder: '#27272A',
};

export const darkTheme: ThemeColors = {
  background: '#09090B',
  surface: '#18181B',
  surfaceHover: '#27272A',
  surfaceActive: '#3F3F46',
  card: '#18181B',
  border: '#27272A',
  borderSubtle: '#1F1F23',
  textPrimary: '#F4F4F5',
  textSecondary: '#A1A1AA',
  textMuted: '#71717A',
  primary: '#38BDF8',
  primaryHover: '#0EA5E9',
  primaryText: '#09090B',
  accent: '#818CF8',
  success: '#22C55E',
  successBg: 'rgba(34, 197, 94, 0.12)',
  successText: '#4ADE80',
  warning: '#F59E0B',
  warningBg: 'rgba(245, 158, 11, 0.12)',
  warningText: '#FBBF24',
  danger: '#EF4444',
  dangerBg: 'rgba(239, 68, 68, 0.12)',
  dangerText: '#F87171',
  info: '#38BDF8',
  infoBg: 'rgba(56, 189, 248, 0.12)',
  infoText: '#7DD3FC',
  terminalBg: '#0D0D11',
  terminalBorder: '#27272A',
};

export const themeConfig = {
  fonts: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  typography: {
    weights: {
      regular: 400,
      medium: 500,
    },
    scale: {
      display: '28px',
      title: '18px',
      body: '14px',
      caption: '12px',
      micro: '11px',
    },
  },
  radii: {
    sm: '8px',
    md: '10px',
    lg: '12px',
    full: '9999px',
  },
  headerHeight: '52px',
  transitions: {
    fast: '0.15s cubic-bezier(0.16, 1, 0.3, 1)',
    normal: '0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    themeSweep: '380ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  shadows: {
    subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.2)',
  },
};
