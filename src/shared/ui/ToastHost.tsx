import { observer } from 'mobx-react-lite';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toastStore, ToastTone } from './toastStore';
import { useThemeColors } from '@/src/shared/theme/useThemeColors';
import { X } from 'lucide-react-native';

const TONE_ACCENT: Record<ToastTone, string> = {
    success: '#16a34a',
    error: '#dc2626',
    warning: '#d97706',
    info: '#0284c7',
};

export const ToastHost = observer(() => {
    const insets = useSafeAreaInsets();
    const colors = useThemeColors();

    if (!toastStore.visible) return null;

    return (
        <View pointerEvents="box-none" style={[styles.host, { top: insets.top + 8 }]}>
            <View
                style={[
                    styles.toast,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                        borderLeftColor: TONE_ACCENT[toastStore.tone],
                    },
                ]}
            >
                <Text style={[styles.message, { color: colors.text }]} numberOfLines={4}>
                    {toastStore.message}
                </Text>
                <Pressable onPress={toastStore.hide} hitSlop={10} accessibilityLabel="Dismiss">
                    <X size={18} color={colors.textMuted} />
                </Pressable>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    host: {
        position: 'absolute',
        left: 12,
        right: 12,
        zIndex: 1000,
        elevation: 20,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    message: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '600',
    },
});
