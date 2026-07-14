import { themeStore } from '@/src/features/theme-toggle/model/store';
import { getThemeColors } from './colors';

export const useThemeColors = () => getThemeColors(themeStore.mode);
