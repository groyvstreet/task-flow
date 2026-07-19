import { useTaskUpdatingStore } from '../model/store';
import { observer } from 'mobx-react-lite';
import {
    Button,
    ConfirmDialog,
    DateTimePicker,
    IconButton,
    LocationFields,
    OptionPicker,
    TextField,
    toastStore,
} from '@/src/shared/ui';
import { useEffect, useState } from 'react';
import { AttachmentList, pickImage, pickDocument } from '@/src/entities/attachment';
import { ActionList } from '@/src/entities/action';
import {
    formatDateTime,
    DEMO_NOTIFICATION_DELAY_SECONDS,
    scheduleDemoNotification,
} from '@/src/shared/lib';
import {
    TASK_STATUS_LABELS,
    TaskStatusBadge,
    type TaskStatus,
} from '@/src/entities/task';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, Bell, MapPin, Pencil, Trash2 } from 'lucide-react-native';
import { useThemeColors, Fonts } from '@/src/shared/theme';

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
                <View style={styles.topBar}>
                    <IconButton onPress={() => router.back()} accessibilityLabel="Back">
                        <ArrowLeft size={20} color={colors.text} />
                    </IconButton>
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
                        style={[styles.locationBox, { backgroundColor: colors.surfaceMuted }]}
                    >
                        <MapPin size={16} color={colors.textMuted} strokeWidth={1.75} />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.locationText, { color: colors.text }]}>
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
                                            backgroundColor: active
                                                ? colors.accent
                                                : colors.surfaceMuted,
                                        },
                                    ]}
                                    onPress={() => store.updateStatus(s)}
                                >
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            fontFamily: Fonts.medium,
                                            color: active ? colors.onAccent : colors.textSecondary,
                                        }}
                                    >
                                        {TASK_STATUS_LABELS[s]}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    <View style={styles.actions}>
                        <Button
                            onPress={store.startEditing}
                            icon={<Pencil size={16} color={colors.onAccent} strokeWidth={1.75} />}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="secondary"
                            onPress={handleDemoNotification}
                            icon={<Bell size={16} color={colors.text} strokeWidth={1.75} />}
                        >
                            Demo notify
                        </Button>
                        <Button
                            variant="dangerSoft"
                            onPress={() => setShowDeleteDialog(true)}
                            accessibilityLabel="Delete task"
                            style={styles.dangerIconBtn}
                            icon={<Trash2 size={16} color={colors.danger} />}
                        />
                    </View>

                    {demoMessage ? (
                        <Text style={{ color: colors.info, fontSize: 13 }}>{demoMessage}</Text>
                    ) : null}

                    <ActionList taskId={id} />
                </ScrollView>

                <ConfirmDialog
                    visible={showDeleteDialog}
                    title="Delete this task?"
                    message="This cannot be undone from the app."
                    showIcon={false}
                    onCancel={() => setShowDeleteDialog(false)}
                    onConfirm={handleDelete}
                />
            </View>
        );
    }

    return (
        <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
            <View style={styles.topBar}>
                <IconButton onPress={store.cancelEditing} accessibilityLabel="Cancel editing">
                    <ArrowLeft size={20} color={colors.text} />
                </IconButton>
                <Text style={[styles.topTitle, { color: colors.text }]}>Edit task</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <TextField
                    label="Title *"
                    value={store.title}
                    onChangeText={store.setTitle}
                    error={store.errors.title}
                />

                <TextField
                    label="Description *"
                    value={store.description}
                    onChangeText={store.setDescription}
                    error={store.errors.description}
                    multiline
                />

                <DateTimePicker
                    label="Due date & time *"
                    value={store.dueDate}
                    onValueChange={store.setDueDate}
                    error={store.errors.dueDate}
                />

                <LocationFields
                    address={store.location.address}
                    latitude={store.location.latitude}
                    longitude={store.location.longitude}
                    addressError={store.errors.location}
                    addressLabel="Location *"
                    addressPlaceholder="Address (geocodes to coordinates)"
                    coordinatePlaceholder="Auto from address"
                    onAddressChange={store.setLocationAddress}
                    onCoordinatesChange={store.setLocationCoordinateFields}
                    isGeocoding={store.isGeocoding}
                    geocodeHint={store.geocodeHint}
                />

                <OptionPicker
                    label="Status"
                    value={store.status}
                    options={STATUS_OPTIONS}
                    onChange={store.setStatus}
                />

                <View style={styles.field}>
                    <Text style={[styles.label, { color: colors.textMuted }]}>Attachments</Text>
                    <View style={styles.row}>
                        <Button variant="secondary" onPress={handlePickImage}>
                            Add image
                        </Button>
                        <Button variant="secondary" onPress={handlePickDocument}>
                            Add file
                        </Button>
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
                    <Button onPress={handleSave} loading={saving} style={{ flex: 1 }}>
                        Save
                    </Button>
                    <Button
                        variant="secondary"
                        onPress={store.cancelEditing}
                        style={{ flex: 1 }}
                        textStyle={{ color: colors.textSecondary }}
                    >
                        Cancel
                    </Button>
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
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    topTitle: { fontSize: 16, fontFamily: Fonts.semibold },
    content: { padding: 20, gap: 14, paddingBottom: 40 },
    titleRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
    title: {
        flex: 1,
        fontSize: 26,
        fontFamily: Fonts.bold,
        letterSpacing: -0.5,
    },
    body: { fontSize: 15, lineHeight: 22, fontFamily: Fonts.regular },
    meta: { fontSize: 14, fontFamily: Fonts.medium },
    locationBox: {
        flexDirection: 'row',
        gap: 10,
        padding: 14,
        borderRadius: 14,
    },
    locationText: { fontSize: 14, fontFamily: Fonts.medium },
    coords: { fontSize: 12, marginTop: 2, fontFamily: Fonts.regular },
    section: {
        marginTop: 4,
        fontSize: 12,
        fontFamily: Fonts.medium,
        letterSpacing: 0.2,
    },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    chip: {
        minHeight: 40,
        paddingHorizontal: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
    dangerIconBtn: {
        width: 48,
        minHeight: 48,
        paddingHorizontal: 0,
    },
    field: { gap: 8 },
    label: { fontSize: 12, fontFamily: Fonts.medium, letterSpacing: 0.2 },
    row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
});
