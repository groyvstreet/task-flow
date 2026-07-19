import { StyleSheet, Text, View } from 'react-native';
import { ClipboardList } from 'lucide-react-native';
import { useThemeColors, Fonts } from '@/src/shared/theme';
import { observer } from 'mobx-react-lite';

type Props = {
    title?: string;
    message?: string;
};

export const EmptyState = observer(({
    title = 'No tasks yet',
    message = 'Tap + to create your first task',
}: Props) => {
    const colors = useThemeColors();

    return (
        <View style={styles.wrap}>
            <ClipboardList size={32} color={colors.textMuted} strokeWidth={1.5} />
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
        </View>
    );
});

const styles = StyleSheet.create({
    wrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        gap: 8,
    },
    title: {
        fontSize: 20,
        fontFamily: Fonts.semibold,
        textAlign: 'center',
        letterSpacing: -0.3,
        marginTop: 8,
    },
    message: {
        fontSize: 15,
        fontFamily: Fonts.regular,
        textAlign: 'center',
        lineHeight: 22,
    },
});
