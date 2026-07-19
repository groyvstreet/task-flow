import { observer } from 'mobx-react-lite';
import { ThemeToggle } from '@/src/features/theme-toggle';
import { SyncButton } from '@/src/features/sync';
import { ClearDataButton } from '@/src/features/clear-data';
import { useTaskStore } from '@/src/entities/task';
import { useThemeColors, Fonts } from '@/src/shared/theme';
import { StyleSheet, Text, View } from 'react-native';

export const TasksHeader = observer(() => {
    const taskStore = useTaskStore();
    const colors = useThemeColors();

    return (
        <View style={styles.header}>
            <View style={styles.headerText}>
                <Text style={[styles.brand, { color: colors.text }]}>TaskFlow</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    {taskStore.pendingSyncCount > 0
                        ? `${taskStore.pendingSyncCount} waiting to sync`
                        : 'Your tasks'}
                </Text>
            </View>
            <View style={styles.actions}>
                <ThemeToggle />
                <SyncButton />
                <ClearDataButton />
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    headerText: { flex: 1, gap: 4 },
    brand: {
        fontSize: 32,
        fontFamily: Fonts.bold,
        letterSpacing: -0.8,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        letterSpacing: -0.1,
    },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
});
