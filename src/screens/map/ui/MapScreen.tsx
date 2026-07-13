import { TaskMap } from '@/src/features/task-map';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/shared/theme/useThemeColors';
import { observer } from 'mobx-react-lite';

export const MapScreen = observer(() => {
    const colors = useThemeColors();

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
            <View
                style={[
                    styles.header,
                    { backgroundColor: colors.surface, borderBottomColor: colors.border },
                ]}
            >
                <Text style={[styles.eyebrow, { color: colors.accent }]}>Locations</Text>
                <Text style={[styles.title, { color: colors.text }]}>Task map</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    Pins for tasks with coordinates
                </Text>
            </View>
            <TaskMap />
        </SafeAreaView>
    );
});

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 2,
    },
    eyebrow: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    title: { fontSize: 26, fontWeight: '800' },
    subtitle: { fontSize: 13 },
});
