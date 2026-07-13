import { observer } from 'mobx-react-lite';
import { useTaskStore } from '@/src/entities/task';
import { TaskSortField } from '@/src/entities/task/model/types';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/src/shared/theme/useThemeColors';

const SORT_OPTIONS: { field: TaskSortField; label: string }[] = [
    { field: 'creationDate', label: 'Added' },
    { field: 'dueDate', label: 'Due' },
    { field: 'status', label: 'Status' },
];

export const TaskSorting = observer(() => {
    const taskStore = useTaskStore();
    const colors = useThemeColors();

    return (
        <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
            <Text style={[styles.label, { color: colors.textMuted }]}>Sort</Text>
            <View style={styles.row}>
                {SORT_OPTIONS.map(opt => {
                    const active = taskStore.sortField === opt.field;
                    return (
                        <Pressable
                            key={opt.field}
                            style={[
                                styles.chip,
                                {
                                    borderColor: active ? colors.accent : colors.border,
                                    backgroundColor: active ? colors.accent : colors.surface,
                                },
                            ]}
                            onPress={() => taskStore.setSortField(opt.field)}
                        >
                            <Text
                                style={[
                                    styles.chipText,
                                    { color: active ? '#fff' : colors.textSecondary },
                                ]}
                            >
                                {opt.label}
                                {active ? (taskStore.sortAscending ? ' ↑' : ' ↓') : ''}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    wrap: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
    label: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        minHeight: 36,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipText: { fontSize: 13, fontWeight: '600' },
});
