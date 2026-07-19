import { createContext, useContext } from 'react';
import { getThemeColors, type ThemeMode } from './colors';

export const ThemeModeContext = createContext<ThemeMode>('light');

export const useThemeMode = (): ThemeMode => useContext(ThemeModeContext);

export const useThemeColors = () => getThemeColors(useThemeMode());
