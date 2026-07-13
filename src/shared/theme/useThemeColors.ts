import { themeStore } from '@/src/features/theme-toggle/model/store';
import { getThemeColors } from './colors';

/** Call inside observer() components so theme changes re-render. */
export const useThemeColors = () => getThemeColors(themeStore.mode);
