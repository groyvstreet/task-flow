export type ThemeMode = 'light' | 'dark';

export type AppColors = {
    bg: string;
    surface: string;
    surfaceMuted: string;
    border: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    accent: string;
    onAccent: string;
    accentSoft: string;
    accentBorder: string;
    warning: string;
    warningBg: string;
    danger: string;
    dangerBg: string;
    success: string;
    successBg: string;
    info: string;
    infoBg: string;
    fab: string;
    overlay: string;
    inputBg: string;
};

/** Cool stone + ink — minimal, no teal/purple chrome */
export const LIGHT_COLORS: AppColors = {
    bg: '#F5F5F5',
    surface: '#FFFFFF',
    surfaceMuted: '#EFEFEF',
    border: '#E5E5E5',
    text: '#171717',
    textSecondary: '#404040',
    textMuted: '#737373',
    accent: '#171717',
    onAccent: '#FAFAFA',
    accentSoft: '#F0F0F0',
    accentBorder: '#D4D4D4',
    warning: '#A16207',
    warningBg: '#FEF9C3',
    danger: '#B91C1C',
    dangerBg: '#FEE2E2',
    success: '#166534',
    successBg: '#DCFCE7',
    info: '#1D4ED8',
    infoBg: '#DBEAFE',
    fab: '#171717',
    overlay: 'rgba(23, 23, 23, 0.4)',
    inputBg: '#FAFAFA',
};

export const DARK_COLORS: AppColors = {
    bg: '#0A0A0A',
    surface: '#141414',
    surfaceMuted: '#1C1C1C',
    border: '#2A2A2A',
    text: '#FAFAFA',
    textSecondary: '#D4D4D4',
    textMuted: '#A3A3A3',
    accent: '#FAFAFA',
    onAccent: '#171717',
    accentSoft: '#1C1C1C',
    accentBorder: '#333333',
    warning: '#FBBF24',
    warningBg: '#422006',
    danger: '#F87171',
    dangerBg: '#450A0A',
    success: '#4ADE80',
    successBg: '#14532D',
    info: '#93C5FD',
    infoBg: '#1E3A5F',
    fab: '#FAFAFA',
    overlay: 'rgba(0, 0, 0, 0.72)',
    inputBg: '#1C1C1C',
};

export const getThemeColors = (mode: ThemeMode): AppColors =>
    mode === 'dark' ? DARK_COLORS : LIGHT_COLORS;
