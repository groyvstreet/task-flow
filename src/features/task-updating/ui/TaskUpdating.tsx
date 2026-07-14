import { useTaskUpdatingStore } from '../model/store';
import { observer } from 'mobx-react-lite';
import { DateTimePicker, OptionPicker, TaskStatusBadge } from '@/src/shared/ui';
import { useEffect, useState } from 'react';
import { pickImage, pickDocument } from '@/src/features/attachment-picker';
import { AttachmentList } from '@/src/entities/attachment';
import { ActionList } from '@/src/entities/action/ui/ActionList';
import { formatDateTime } from '@/src/shared/lib/format';
import { TASK_STATUS_LABELS, TaskStatus } from '@/src/entities/task/model/types';
import { DEMO_NOTIFICATION_DELAY_SECONDS } from '@/src/shared/lib/constants';
import { scheduleDemoNotification } from '@/src/shared/lib/notifications';
import { toastStore } from '@/src/shared/ui';
import { router } from 'expo-router';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { ArrowLeft, Bell, MapPin, Pencil, Trash2 } from 'lucide-react-native';
import { useThemeColors } from '@/src/shared/theme/useThemeColors';

type Props = { id: string };

const STATUS_OPTIONS = (Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map(value => ({
    value,
    label: TASK_STATUS_LABELS[value],
}));

const QUICK_STATUSES: TaskStatus[] = ['in-progress', 'completed', 'cancelled'];

export const TaskUpdating = observer(({ id }: Props) => {
    const store = useTaskUpdatingStore();
    const colors = useThemeColors();
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [demoMessage, setDemoMessage] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        store.setTaskById(id);
    }, [id]);

    const handlePickImage = async () => {
        const attachment = await pickImage();
        if (attachment) store.addPendingAttachment(attachment);
    };

    const handlePickDocument = async () => {
        const attachment = await pickDocument();
        if (attachment) store.addPendingAttachment(attachment);
    };

    const handleDelete = async () => {
        await store.deleteTask();
        setShowDeleteDialog(false);
        router.back();
    };

    const handleDemoNotification = async () => {
        if (!store.originalTask) return;

        setDemoMessage('Scheduling demo notification…');
        toastStore.show('Scheduling demo notification…', 'info');

        const result = await scheduleDemoNotification(
            store.originalTask.id,
            store.originalTask.title,
        );

        if (result.notificationId) {
            const message =
                result.warning ??
                `Demo notification scheduled — wait ~${DEMO_NOTIFICATION_DELAY_SECONDS}s (minimize app to see system tray)`;
            setDemoMessage(message);
            toastStore.show(message, result.warning ? 'warning' : 'success', 4500);
            return;
        }

        const fail = result.warning ?? 'Failed to schedule demo notification';
        setDemoMessage(fail);
        toastStore.show(fail, 'error', 4500);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await store.updateTask();
            if (result?.warning) {
                toastStore.show(result.warning, 'warning', 5000);
            }
        } finally {
            setSaving(false);
        }
    };

    if (!store.originalTask) {
        return (
            <View style={[styles.center, { backgroundColor: colors.bg }]}>
                <Text style={{ color: colors.textMuted }}>Task not found</Text>
                <Pressable style={styles.backLink} onPress={() => router.back()}>
                    <Text style={{ color: colors.accent, fontWeight: '700' }}>Back to list</Text>
                </Pressable>
            </View>
        );
    }

    if (!store.isEditing) {
        return (
            <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
                <View
                    style={[
                        styles.topBar,
                        { backgroundColor: colors.surface, borderBottomColor: colors.border },
                    ]}
                >
                    <Pressable
                        style={[styles.iconBtn, { backgroundColor: colors.surfaceMuted }]}
                        onPress={() => router.back()}
                        accessibilityLabel="Back"
                    >
                        <ArrowLeft size={20} color={colors.text} />
                    </Pressable>
                    <Text style={[styles.topTitle, { color: colors.text }]}>Task details</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={[styles.title, { color: colors.text }]}>
                            {store.originalTask.title}
                        </Text>
                        <TaskStatusBadge status={store.originalTask.status} />
                    </View>

                    <Text style={[styles.body, { color: colors.textSecondary }]}>
                        {store.originalTask.description}
                    </Text>
                    <Text style={[styles.meta, { color: colors.text }]}>
                        Due {formatDateTime(store.originalTask.dueDate)}
                    </Text>

                    <View
                        style={[
                            styles.locationBox,
                            { backgroundColor: colors.accentSoft, borderColor: colors.accentBorder },
                        ]}
                    >
                        <MapPin size={16} color={colors.accent} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.locationText, { color: colors.accent }]}>
                                {store.originalTask.location.address}
                            </Text>
                            {store.originalTask.location.latitude != null ? (
                                <Text style={[styles.coords, { color: colors.textMuted }]}>
                                    {store.originalTask.location.latitude},{' '}
                                    {store.originalTask.location.longitude}
                                </Text>
                            ) : null}
                        </View>
                    </View>

                    <AttachmentList attachments={store.allAttachments} />

                    <Text style={[styles.section, { color: colors.textMuted }]}>Quick status</Text>
                    <View style={styles.chipRow}>
                        {QUICK_STATUSES.map(s => {
                            const active = store.originalTask!.status === s;
                            return (
                                <Pressable
                                    key={s}
                                    style={[
                                        styles.chip,
                                        {
                                            borderColor: active ? colors.accent : colors.border,
                                            backgroundColor: active ? colors.accent : colors.surface,
                                        },
                                    ]}
                                    onPress={() => store.updateStatus(s)}
                                >
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontWeight: '600',
                                            color: active ? '#fff' : colors.textSecondary,
                                        }}
                                    >
                                        {TASK_STATUS_LABELS[s]}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    <View style={styles.actions}>
                        <Pressable
                            style={[styles.primaryBtn, { backgroundColor: colors.fab }]}
                            onPress={store.startEditing}
                        >
                            <Pencil size={16} color="#fff" />
                            <Text style={styles.primaryBtnText}>Edit</Text>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.secondaryBtn,
                                {
                                    borderColor: colors.accentBorder,
                                    backgroundColor: colors.accentSoft,
                                },
                            ]}
                            onPress={handleDemoNotification}
                        >
                            <Bell size={16} color={colors.accent} />
                            <Text style={[styles.secondaryBtnText, { color: colors.accent }]}>
                                Demo notify
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[styles.dangerBtn, { backgroundColor: colors.dangerBg }]}
                            onPress={() => setShowDeleteDialog(true)}
                        >
                            <Trash2 size={16} color={colors.danger} />
                        </Pressable>
                    </View>

                    {demoMessage ? (
                        <Text style={{ color: colors.info, fontSize: 13 }}>{demoMessage}</Text>
                    ) : null}

                    <ActionList taskId={id} />
                </ScrollView>

                <Modal transparent visible={showDeleteDialog} animationType="fade">
                    <View style={[styles.dialogBackdrop, { backgroundColor: colors.overlay }]}>
                        <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
                            <Text style={[styles.dialogTitle, { color: colors.text }]}>
                                Delete this task?
                            </Text>
                            <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                                This cannot be undone from the app.
                            </Text>
                            <View style={styles.dialogActions}>
                                <Pressable
                                    style={[
                                        styles.dialogCancel,
                                        { backgroundColor: colors.surfaceMuted },
                                    ]}
                                    onPress={() => setShowDeleteDialog(false)}
                                >
                                    <Text style={{ fontWeight: '600', color: colors.textSecondary }}>
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
            </View>
        );
    }

    const inputStyle = {
        borderColor: colors.border,
        backgroundColor: colors.inputBg,
        color: colors.text,
    };

    return (
        <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
            <View
                style={[
                    styles.topBar,
                    { backgroundColor: colors.surface, borderBottomColor: colors.border },
                ]}
            >
                <Pressable
                    style={[styles.iconBtn, { backgroundColor: colors.surfaceMuted }]}
                    onPress={store.cancelEditing}
                >
                    <ArrowLeft size={20} color={colors.text} />
                </Pressable>
                <Text style={[styles.topTitle, { color: colors.text }]}>Edit task</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Title *</Text>
                    <TextInput
                        style={[
                            styles.input,
                            inputStyle,
                            store.errors.title && { borderColor: colors.danger },
                        ]}
                        value={store.title}
                        onChangeText={store.setTitle}
                    />
                    {store.errors.title ? (
                        <Text style={{ color: colors.danger, fontSize: 12 }}>{store.errors.title}</Text>
                    ) : null}
                </View>

                <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Description *</Text>
                    <TextInput
                        style={[
                            styles.input,
                            styles.textarea,
                            inputStyle,
                            store.errors.description && { borderColor: colors.danger },
                        ]}
                        value={store.description}
                        onChangeText={store.setDescription}
                        multiline
                        textAlignVertical="top"
                    />
                    {store.errors.description ? (
                        <Text style={{ color: colors.danger, fontSize: 12 }}>
                            {store.errors.description}
                        </Text>
                    ) : null}
                </View>

                <DateTimePicker
                    label="Due date & time *"
                    value={store.dueDate}
                    onValueChange={store.setDueDate}
                    error={store.errors.dueDate}
                />

                <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Location *</Text>
                    <TextInput
                        style={[
                            styles.input,
                            inputStyle,
                            store.errors.location && { borderColor: colors.danger },
                        ]}
                        value={store.location.address}
                        onChangeText={store.setLocationAddress}
                        placeholder="Address (geocodes to coordinates)"
                        placeholderTextColor={colors.textMuted}
                    />
                    {store.errors.location ? (
                        <Text style={{ color: colors.danger, fontSize: 12 }}>
                            {store.errors.location}
                        </Text>
                    ) : null}
                </View>

                <View style={styles.row}>
                    <View style={[styles.field, { flex: 1 }]}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Latitude</Text>
                        <TextInput
                            style={[styles.input, inputStyle]}
                            keyboardType="numeric"
                            placeholder="Auto from address"
                            placeholderTextColor={colors.textMuted}
                            value={store.location.latitude?.toString() ?? ''}
                            onChangeText={v =>
                                store.setLocationCoordinateFields(
                                    v,
                                    store.location.longitude?.toString() ?? '',
                                )
                            }
                        />
                    </View>
                    <View style={[styles.field, { flex: 1 }]}>
                        <Text style={[styles.label, { color: colors.textSecondary }]}>Longitude</Text>
                        <TextInput
                            style={[styles.input, inputStyle]}
                            keyboardType="numeric"
                            placeholder="Auto from address"
                            placeholderTextColor={colors.textMuted}
                            value={store.location.longitude?.toString() ?? ''}
                            onChangeText={v =>
                                store.setLocationCoordinateFields(
                                    store.location.latitude?.toString() ?? '',
                                    v,
                                )
                            }
                        />
                    </View>
                </View>

                {store.isGeocoding || store.geocodeHint ? (
                    <Text
                        style={{
                            fontSize: 12,
                            color: store.isGeocoding ? colors.info : colors.warning,
                        }}
                    >
                        {store.geocodeHint ?? 'Resolving location…'}
                    </Text>
                ) : null}

                <OptionPicker
                    label="Status"
                    value={store.status}
                    options={STATUS_OPTIONS}
                    onChange={store.setStatus}
                />

                <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.textSecondary }]}>Attachments</Text>
                    <View style={styles.row}>
                        <Pressable
                            style={[
                                styles.secondaryBtn,
                                {
                                    borderColor: colors.accentBorder,
                                    backgroundColor: colors.accentSoft,
                                },
                            ]}
                            onPress={handlePickImage}
                        >
                            <Text style={[styles.secondaryBtnText, { color: colors.accent }]}>
                                Add image
                            </Text>
                        </Pressable>
                        <Pressable
                            style={[
                                styles.secondaryBtn,
                                {
                                    borderColor: colors.accentBorder,
                                    backgroundColor: colors.accentSoft,
                                },
                            ]}
                            onPress={handlePickDocument}
                        >
                            <Text style={[styles.secondaryBtnText, { color: colors.accent }]}>
                                Add file
                            </Text>
                        </Pressable>
                    </View>
                    <AttachmentList
                        attachments={store.existingAttachments}
                        onDelete={store.removeExistingAttachment}
                        title=""
                    />
                    <AttachmentList
                        attachments={store.pendingAttachments}
                        onDelete={att => store.removePendingAttachment(att.id)}
                        title="New"
                    />
                </View>

                <View style={styles.row}>
                    <Pressable
                        style={[
                            styles.primaryBtn,
                            { flex: 1, backgroundColor: colors.fab },
                            saving && { opacity: 0.7 },
                        ]}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.primaryBtnText}>Save</Text>
                        )}
                    </Pressable>
                    <Pressable
                        style={[
                            styles.secondaryBtn,
                            {
                                flex: 1,
                                borderColor: colors.border,
                                backgroundColor: colors.surface,
                            },
                        ]}
                        onPress={store.cancelEditing}
                    >
                        <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>
                            Cancel
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
});

const styles = StyleSheet.create({
    wrap: { flex: 1 },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    backLink: { padding: 12 },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topTitle: { fontSize: 16, fontWeight: '700' },
    iconBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: { padding: 16, gap: 14, paddingBottom: 40 },
    titleRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
    title: { flex: 1, fontSize: 24, fontWeight: '800' },
    body: { fontSize: 15, lineHeight: 22 },
    meta: { fontSize: 14, fontWeight: '600' },
    locationBox: {
        flexDirection: 'row',
        gap: 10,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
    },
    locationText: { fontSize: 14, fontWeight: '600' },
    coords: { fontSize: 12, marginTop: 2 },
    section: {
        marginTop: 4,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        minHeight: 40,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    primaryBtn: {
        minHeight: 48,
        paddingHorizontal: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
    secondaryBtn: {
        minHeight: 48,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    secondaryBtnText: { fontWeight: '700', fontSize: 14 },
    dangerBtn: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    field: { gap: 6 },
    label: { fontSize: 13, fontWeight: '600' },
    input: {
        minHeight: 48,
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 14,
        fontSize: 16,
    },
    textarea: { minHeight: 110, paddingTop: 12, paddingBottom: 12 },
    row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    dialogBackdrop: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    dialog: { width: '100%', borderRadius: 18, padding: 20, gap: 10 },
    dialogTitle: { fontSize: 18, fontWeight: '700' },
    dialogActions: { flexDirection: 'row', gap: 10, marginTop: 8 },
    dialogCancel: {
        flex: 1,
        minHeight: 46,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialogDelete: {
        flex: 1,
        minHeight: 46,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialogDeleteText: { fontWeight: '700', color: '#fff' },
});
