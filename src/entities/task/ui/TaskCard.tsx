import { router } from 'expo-router';
import { Task } from '../model/types';
import { useTaskStore } from '../model/store';
import { observer } from 'mobx-react-lite';
import { formatDateTime } from '@/src/shared/lib/format';
import { TaskStatusBadge, SyncStatusBadge } from '@/src/shared/ui';
import { MapPin, Trash2, AlertTriangle } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/src/shared/theme/useThemeColors';

type Props = { task: Task };

const STATUS_BORDER: Record<Task['status'], string> = {
    new: '#0284c7',
    'in-progress': '#ea580c',
    completed: '#16a34a',
    cancelled: '#94a3b8',
};

export const TaskCard = observer(({ task }: Props) => {
    const taskStore = useTaskStore();
    const colors = useThemeColors();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handleDelete = async () => {
        await taskStore.removeTask(task);
        setShowDeleteDialog(false);
    };

    return (
        <Pressable
            style={[
                styles.card,
                {
                    borderLeftColor: STATUS_BORDER[task.status],
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                },
            ]}
            onPress={() => router.push(`/${task.id}`)}
            accessibilityRole="button"
            accessibilityLabel={`Open task ${task.title}`}
        >
            <View style={styles.topRow}>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
                    {task.title}
                </Text>
                <TaskStatusBadge status={task.status} />
            </View>

            <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
                {task.description}
            </Text>

            <Text style={[styles.meta, { color: colors.textSecondary }]}>
                Due {formatDateTime(task.dueDate)}
            </Text>

            <View style={styles.locationRow}>
                <MapPin size={14} color={colors.textMuted} />
                <Text style={[styles.location, { color: colors.textMuted }]} numberOfLines={1}>
                    {task.location.address}
                </Text>
            </View>

            <View style={styles.footer}>
                <SyncStatusBadge status={task.syncStatus} />
                <Pressable
                    onPress={e => {
                        e.stopPropagation?.();
                        setShowDeleteDialog(true);
                    }}
                    style={[styles.deleteBtn, { backgroundColor: colors.dangerBg }]}
                    accessibilityLabel={`Delete ${task.title}`}
                >
                    <Trash2 size={16} color={colors.danger} />
                </Pressable>
            </View>

            <Modal transparent visible={showDeleteDialog} animationType="fade">
                <View style={[styles.dialogBackdrop, { backgroundColor: colors.overlay }]}>
                    <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
                        <AlertTriangle size={28} color={colors.danger} />
                        <Text style={[styles.dialogTitle, { color: colors.text }]}>Delete task?</Text>
                        <Text style={[styles.dialogBody, { color: colors.textMuted }]}>
                            “{task.title}” will be removed from this device and queued for sync delete.
                        </Text>
                        <View style={styles.dialogActions}>
                            <Pressable
                                style={[styles.dialogCancel, { backgroundColor: colors.surfaceMuted }]}
                                onPress={() => setShowDeleteDialog(false)}
                            >
                                <Text style={[styles.dialogCancelText, { color: colors.textSecondary }]}>
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[styles.dialogDelete, { backgroundColor: colors.danger }]}
                                onPress={handleDelete}
                            >
                                <Text style={styles.dialogDeleteText}>Delete</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </Pressable>
    );
});

const styles = StyleSheet.create({
    card: {
        borderRadius: 16,
        padding: 16,
        gap: 8,
        borderLeftWidth: 4,
        borderWidth: 1,
    },
    topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    title: { flex: 1, fontSize: 17, fontWeight: '700' },
    description: { fontSize: 14, lineHeight: 20 },
    meta: { fontSize: 13, fontWeight: '600' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    location: { flex: 1, fontSize: 13 },
    footer: {
        marginTop: 4,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    deleteBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialogBackdrop: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    dialog: {
        width: '100%',
        borderRadius: 18,
        padding: 20,
        gap: 10,
        alignItems: 'center',
    },
    dialogTitle: { fontSize: 18, fontWeight: '700' },
    dialogBody: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
    dialogActions: { flexDirection: 'row', gap: 10, marginTop: 8, width: '100%' },
    dialogCancel: {
        flex: 1,
        minHeight: 46,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialogCancelText: { fontWeight: '600' },
    dialogDelete: {
        flex: 1,
        minHeight: 46,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialogDeleteText: { fontWeight: '700', color: '#fff' },
});
