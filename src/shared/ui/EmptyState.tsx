import { StyleSheet, Text, View } from 'react-native';
import { ClipboardList } from 'lucide-react-native';
import { useThemeColors } from '@/src/shared/theme/useThemeColors';
import { observer } from 'mobx-react-lite';

type Props = {
    title?: string;
    message?: string;
};

export const EmptyState = observer(({
    title = 'No tasks yet',
    message = 'Tap + to create your first field task',
}: Props) => {
    const colors = useThemeColors();

    return (
        <View style={styles.wrap}>
            <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
                <ClipboardList size={36} color={colors.accent} />
            </View>
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
        padding: 32,
        gap: 10,
    },
    iconWrap: {
        width: 72,
        height: 72,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    title: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
    message: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
