import { observer } from 'mobx-react-lite';
import { useThemeStore } from '../model/store';
import { Moon, Sun } from 'lucide-react-native';
import { useThemeColors } from '@/src/shared/theme';
import { IconButton } from '@/src/shared/ui';

export const ThemeToggle = observer(() => {
    const themeStore = useThemeStore();
    const colors = useThemeColors();

    return (
        <IconButton
            onPress={themeStore.toggle}
            accessibilityLabel={`Switch to ${themeStore.mode === 'dark' ? 'light' : 'dark'} theme`}
        >
            {themeStore.mode === 'dark' ? (
                <Sun size={18} color={colors.text} strokeWidth={1.75} />
            ) : (
                <Moon size={18} color={colors.text} strokeWidth={1.75} />
            )}
        </IconButton>
    );
});
