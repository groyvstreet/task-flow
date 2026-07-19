import { observer } from 'mobx-react-lite';
import { useThemeStore } from '../model/store';
import { Moon, Sun } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
import { useThemeColors } from '@/src/shared/theme';

export const ThemeToggle = observer(() => {
    const themeStore = useThemeStore();
    const colors = useThemeColors();

    return (
        <Pressable
            style={[styles.btn, { backgroundColor: colors.surfaceMuted }]}
            onPress={themeStore.toggle}
            accessibilityLabel={`Switch to ${themeStore.mode === 'dark' ? 'light' : 'dark'} theme`}
        >
            {themeStore.mode === 'dark' ? (
                <Sun size={18} color={colors.text} strokeWidth={1.75} />
            ) : (
                <Moon size={18} color={colors.text} strokeWidth={1.75} />
            )}
        </Pressable>
    );
});

const styles = StyleSheet.create({
    btn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
