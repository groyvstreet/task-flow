import { observer } from 'mobx-react-lite';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { toastStore, ToastTone } from './toastStore';
import { useThemeColors, Fonts } from '@/src/shared/theme';
import { X } from 'lucide-react-native';

const TONE_ACCENT: Record<ToastTone, string> = {
    success: '#166534',
    error: '#B91C1C',
    warning: '#A16207',
    info: '#1D4ED8',
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
                    },
                ]}
            >
                <View
                    style={[styles.dot, { backgroundColor: TONE_ACCENT[toastStore.tone] }]}
                />
                <Text style={[styles.message, { color: colors.text }]} numberOfLines={4}>
                    {toastStore.message}
                </Text>
                <Pressable onPress={toastStore.hide} hitSlop={10} accessibilityLabel="Dismiss">
                    <X size={18} color={colors.textMuted} strokeWidth={1.75} />
                </Pressable>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    host: {
        position: 'absolute',
        left: 16,
        right: 16,
        zIndex: 1000,
        elevation: 20,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 14,
        borderRadius: 16,
        borderWidth: StyleSheet.hairlineWidth,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 5,
    },
    message: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        fontFamily: Fonts.medium,
    },
});
