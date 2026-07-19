import { makeAutoObservable, runInAction } from 'mobx';
import { createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/src/shared/lib';
import type { ThemeMode } from '@/src/shared/theme';

export class ThemeStore {
    mode: ThemeMode = 'light';

    constructor() {
        makeAutoObservable(this);
    }

    init = async () => {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        if (saved === 'light' || saved === 'dark') {
            runInAction(() => {
                this.mode = saved;
            });
        }
    };

    toggle = async () => {
        const next: ThemeMode = this.mode === 'dark' ? 'light' : 'dark';
        runInAction(() => {
            this.mode = next;
        });
        await AsyncStorage.setItem(STORAGE_KEYS.THEME, next);
    };

    setMode = async (mode: ThemeMode) => {
        runInAction(() => {
            this.mode = mode;
        });
        await AsyncStorage.setItem(STORAGE_KEYS.THEME, mode);
    };
}

export const themeStore = new ThemeStore();

const themeContext = createContext(themeStore);

export const useThemeStore = () => useContext(themeContext);
