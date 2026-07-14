import { TaskAdding } from '@/src/features/task-adding';
import { TaskSorting } from '@/src/features/task-sorting';
import { SyncButton } from '@/src/features/sync';
import { ThemeToggle } from '@/src/features/theme-toggle';
import { TaskList, useTaskStore } from '@/src/entities/task';
import { useThemeColors } from '@/src/shared/theme/useThemeColors';
import { observer } from 'mobx-react-lite';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const TasksScreen = observer(() => {
    const taskStore = useTaskStore();
    const colors = useThemeColors();

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
            <View
                style={[
                    styles.header,
                    { backgroundColor: colors.surface, borderBottomColor: colors.border },
                ]}
            >
                <View style={styles.headerText}>
                    <Text style={[styles.eyebrow, { color: colors.accent }]}>TaskFlow</Text>
                    <Text style={[styles.title, { color: colors.text }]}>PK-RN-2003</Text>
                    {taskStore.pendingSyncCount > 0 ? (
                        <Text style={[styles.pending, { color: colors.warning }]}>
                            {taskStore.pendingSyncCount} pending sync
                        </Text>
                    ) : (
                        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                            Plan, track, and close field tasks
                        </Text>
                    )}
                </View>
                <View style={styles.actions}>
                    <ThemeToggle />
                    <SyncButton />
                </View>
            </View>
            <TaskSorting />
            <TaskList />
            <TaskAdding />
        </SafeAreaView>
    );
});

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerText: { flex: 1, gap: 2 },
    eyebrow: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    title: { fontSize: 26, fontWeight: '800' },
    subtitle: { fontSize: 13, marginTop: 2 },
    pending: { fontSize: 13, fontWeight: '600', marginTop: 2 },
    actions: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
});
