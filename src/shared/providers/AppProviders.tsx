import { themeStore } from '@/src/features/theme-toggle/model/store';
import { initializeApp, setupNotificationHandlers } from '@/src/shared/lib/app-init';
import { ToastHost } from '@/src/shared/ui/ToastHost';
import { useThemeColors } from '@/src/shared/theme/useThemeColors';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { observer } from 'mobx-react-lite';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

type Props = {
    children: ReactNode;
};

export const AppProviders = observer(({ children }: Props) => {
    const [ready, setReady] = useState(false);
    const colors = useThemeColors();

    useEffect(() => {
        initializeApp()
            .then(() => setReady(true))
            .catch(() => setReady(true));
        setupNotificationHandlers();
    }, []);

    if (!ready) {
        return (
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
        );
    }

    return (
        <ThemeProvider value={themeStore.mode === 'dark' ? DarkTheme : DefaultTheme}>
            <View style={{ flex: 1, backgroundColor: colors.bg }}>
                {children}
                <ToastHost />
            </View>
        </ThemeProvider>
    );
});
