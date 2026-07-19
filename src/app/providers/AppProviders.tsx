import { themeStore } from '@/src/features/theme-toggle';
import { initializeApp, setupNotificationHandlers } from '../lib/init';
import { ToastHost } from '@/src/shared/ui';
import { ThemeModeContext, getThemeColors } from '@/src/shared/theme';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

type Props = {
    children: ReactNode;
};

export const AppProviders = observer(({ children }: Props) => {
    const [ready, setReady] = useState(false);
    const colors = getThemeColors(themeStore.mode);

    useEffect(() => {
        initializeApp()
            .then(() => setReady(true))
            .catch(() => setReady(true));
        setupNotificationHandlers();
    }, []);

    return (
        <ThemeModeContext.Provider value={themeStore.mode}>
            {!ready ? (
                <View
                    style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.bg,
                    }}
                >
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : (
                <ThemeProvider value={themeStore.mode === 'dark' ? DarkTheme : DefaultTheme}>
                    <View style={{ flex: 1, backgroundColor: colors.bg }}>
                        {children}
                        <ToastHost />
                    </View>
                </ThemeProvider>
            )}
        </ThemeModeContext.Provider>
    );
});
