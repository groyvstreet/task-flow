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

export const LIGHT_COLORS: AppColors = {
    bg: '#f8fafc',
    surface: '#ffffff',
    surfaceMuted: '#f1f5f9',
    border: '#e2e8f0',
    text: '#0f172a',
    textSecondary: '#334155',
    textMuted: '#64748b',
    accent: '#0f766e',
    accentSoft: '#f0fdfa',
    accentBorder: '#99f6e4',
    warning: '#b45309',
    warningBg: '#fffbeb',
    danger: '#b91c1c',
    dangerBg: '#fef2f2',
    success: '#15803d',
    successBg: '#dcfce7',
    info: '#0369a1',
    infoBg: '#e0f2fe',
    fab: '#0f766e',
    overlay: 'rgba(15, 23, 42, 0.45)',
    inputBg: '#ffffff',
};

export const DARK_COLORS: AppColors = {
    bg: '#0b1220',
    surface: '#111827',
    surfaceMuted: '#1f2937',
    border: '#334155',
    text: '#f8fafc',
    textSecondary: '#e2e8f0',
    textMuted: '#94a3b8',
    accent: '#2dd4bf',
    accentSoft: '#134e4a',
    accentBorder: '#0f766e',
    warning: '#fbbf24',
    warningBg: '#422006',
    danger: '#f87171',
    dangerBg: '#450a0a',
    success: '#4ade80',
    successBg: '#14532d',
    info: '#38bdf8',
    infoBg: '#0c4a6e',
    fab: '#14b8a6',
    overlay: 'rgba(0, 0, 0, 0.65)',
    inputBg: '#1f2937',
};

export const getThemeColors = (mode: ThemeMode): AppColors =>
    mode === 'dark' ? DARK_COLORS : LIGHT_COLORS;
