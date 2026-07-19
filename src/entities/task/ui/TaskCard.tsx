import { router } from 'expo-router';
import { Task } from '../model/types';
import { useTaskStore } from '../model/store';
import { observer } from 'mobx-react-lite';
import { formatDateTime } from '@/src/shared/lib';
import { TaskStatusBadge } from './TaskStatusBadge';
import { SyncStatusBadge } from './SyncStatusBadge';
import { MapPin, Trash2, AlertTriangle } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColors, Fonts } from '@/src/shared/theme';

type Props = { task: Task };

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
            style={[styles.card, { backgroundColor: colors.surface }]}
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

            {task.description.trim() ? (
                <Text style={[styles.description, { color: colors.textMuted }]} numberOfLines={2}>
                    {task.description}
                </Text>
            ) : null}

            <Text style={[styles.meta, { color: colors.textSecondary }]}>
                Due {formatDateTime(task.dueDate)}
            </Text>

            <View style={styles.locationRow}>
                <MapPin size={14} color={colors.textMuted} strokeWidth={1.75} />
                <Text style={[styles.location, { color: colors.textMuted }]} numberOfLines={1}>
                    {task.location.address}
                </Text>
            </View>

            <View style={[styles.footer, { borderTopColor: colors.border }]}>
                <SyncStatusBadge status={task.syncStatus} />
                <Pressable
                    onPress={e => {
                        e.stopPropagation?.();
                        setShowDeleteDialog(true);
                    }}
                    style={styles.deleteBtn}
                    accessibilityLabel={`Delete ${task.title}`}
                    hitSlop={8}
                >
                    <Trash2 size={16} color={colors.textMuted} strokeWidth={1.75} />
                </Pressable>
            </View>

            <Modal transparent visible={showDeleteDialog} animationType="fade">
                <View style={[styles.dialogBackdrop, { backgroundColor: colors.overlay }]}>
                    <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
                        <AlertTriangle size={24} color={colors.danger} strokeWidth={1.75} />
                        <Text style={[styles.dialogTitle, { color: colors.text }]}>Delete task?</Text>
                        <Text style={[styles.dialogBody, { color: colors.textMuted }]}>
                            “{task.title}” will be removed and queued for sync.
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
        padding: 18,
        gap: 8,
    },
    topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
    title: {
        flex: 1,
        fontSize: 17,
        fontFamily: Fonts.semibold,
        letterSpacing: -0.3,
        lineHeight: 22,
    },
    description: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        lineHeight: 20,
    },
    meta: {
        fontSize: 13,
        fontFamily: Fonts.medium,
    },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    location: { flex: 1, fontSize: 13, fontFamily: Fonts.regular },
    footer: {
        marginTop: 6,
        paddingTop: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    deleteBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
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
        borderRadius: 20,
        padding: 24,
        gap: 10,
        alignItems: 'center',
    },
    dialogTitle: { fontSize: 18, fontFamily: Fonts.semibold },
    dialogBody: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        textAlign: 'center',
        lineHeight: 20,
    },
    dialogActions: { flexDirection: 'row', gap: 10, marginTop: 10, width: '100%' },
    dialogCancel: {
        flex: 1,
        minHeight: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialogCancelText: { fontFamily: Fonts.medium },
    dialogDelete: {
        flex: 1,
        minHeight: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialogDeleteText: { fontFamily: Fonts.semibold, color: '#fff' },
});
