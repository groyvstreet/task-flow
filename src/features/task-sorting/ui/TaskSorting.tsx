import { observer } from 'mobx-react-lite';
import { useTaskStore, type TaskSortField } from '@/src/entities/task';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColors, Fonts } from '@/src/shared/theme';

const SORT_OPTIONS: { field: TaskSortField; label: string }[] = [
    { field: 'creationDate', label: 'Added' },
    { field: 'dueDate', label: 'Due' },
    { field: 'status', label: 'Status' },
];

export const TaskSorting = observer(() => {
    const taskStore = useTaskStore();
    const colors = useThemeColors();

    return (
        <View style={styles.wrap}>
            <View style={styles.row}>
                {SORT_OPTIONS.map(opt => {
                    const active = taskStore.sortField === opt.field;
                    return (
                        <Pressable
                            key={opt.field}
                            style={[
                                styles.chip,
                                {
                                    backgroundColor: active ? colors.accent : 'transparent',
                                },
                            ]}
                            onPress={() => taskStore.setSortField(opt.field)}
                        >
                            <Text
                                style={[
                                    styles.chipText,
                                    { color: active ? colors.onAccent : colors.textMuted },
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
    wrap: { paddingHorizontal: 20, paddingVertical: 4, paddingBottom: 8 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    chip: {
        minHeight: 34,
        paddingHorizontal: 14,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipText: { fontSize: 13, fontFamily: Fonts.medium },
});
