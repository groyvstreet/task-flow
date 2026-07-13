import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useTaskAddingStore } from '../model/store';
import { observer } from 'mobx-react-lite';
import { DateTimePicker, OptionPicker } from '@/src/shared/ui';
import { Plus, X } from 'lucide-react-native';
import { pickImage, pickDocument } from '@/src/features/attachment-picker';
import { AttachmentList } from '@/src/entities/attachment';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TASK_STATUS_LABELS, TaskStatus } from '@/src/entities/task/model/types';
import { useThemeColors } from '@/src/shared/theme/useThemeColors';

const STATUS_OPTIONS = (Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map(value => ({
    value,
    label: TASK_STATUS_LABELS[value],
}));

export const TaskAdding = observer(() => {
    const store = useTaskAddingStore();
    const colors = useThemeColors();

    const handlePickImage = async () => {
        const attachment = await pickImage();
        if (attachment) store.addPendingAttachment(attachment);
    };

    const handlePickDocument = async () => {
        const attachment = await pickDocument();
        if (attachment) store.addPendingAttachment(attachment);
    };

    const handleCreate = async () => {
        const result = await store.addTask();
        if (!result.ok) return;
        if (result.warning) {
            Alert.alert('Task created', result.warning);
        }
    };

    const inputStyle = {
        borderColor: colors.border,
        backgroundColor: colors.inputBg,
        color: colors.text,
    };

    return (
        <>
            <Pressable
                accessibilityLabel="Add new task"
                accessibilityRole="button"
                onPress={store.openModal}
                style={[styles.fab, { backgroundColor: colors.fab }]}
            >
                <Plus size={26} color="#fff" />
            </Pressable>

            <Modal
                visible={store.isModalVisible}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={store.closeModal}
            >
                <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
                    <View
                        style={[
                            styles.header,
                            { backgroundColor: colors.surface, borderBottomColor: colors.border },
                        ]}
                    >
                        <View>
                            <Text style={[styles.headerEyebrow, { color: colors.accent }]}>
                                Field work
                            </Text>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>New task</Text>
                        </View>
                        <Pressable
                            onPress={store.closeModal}
                            style={[styles.closeBtn, { backgroundColor: colors.surfaceMuted }]}
                            accessibilityLabel="Close"
                        >
                            <X size={20} color={colors.textSecondary} />
                        </Pressable>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.content}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Title *</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    inputStyle,
                                    store.errors.title && { borderColor: colors.danger },
                                ]}
                                placeholder="e.g. Inspect HVAC unit"
                                placeholderTextColor={colors.textMuted}
                                value={store.title}
                                onChangeText={store.setTitle}
                            />
                            {store.errors.title ? (
                                <Text style={[styles.error, { color: colors.danger }]}>
                                    {store.errors.title}
                                </Text>
                            ) : null}
                        </View>

                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                Description *
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.textarea,
                                    inputStyle,
                                    store.errors.description && { borderColor: colors.danger },
                                ]}
                                placeholder="What needs to be done on site?"
                                placeholderTextColor={colors.textMuted}
                                value={store.description}
                                onChangeText={store.setDescription}
                                multiline
                                textAlignVertical="top"
                            />
                            {store.errors.description ? (
                                <Text style={[styles.error, { color: colors.danger }]}>
                                    {store.errors.description}
                                </Text>
                            ) : null}
                        </View>

                        <DateTimePicker
                            label="Due date & time *"
                            value={store.dueDate}
                            onValueChange={store.setDueDate}
                            minimumDate={new Date()}
                            error={store.errors.dueDate}
                        />

                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                Location address *
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    inputStyle,
                                    store.errors.location && { borderColor: colors.danger },
                                ]}
                                placeholder="Manual address"
                                placeholderTextColor={colors.textMuted}
                                value={store.location.address}
                                onChangeText={store.setLocationAddress}
                            />
                            {store.errors.location ? (
                                <Text style={[styles.error, { color: colors.danger }]}>
                                    {store.errors.location}
                                </Text>
                            ) : null}
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.field, { flex: 1 }]}>
                                <Text style={[styles.label, { color: colors.textSecondary }]}>
                                    Latitude
                                </Text>
                                <TextInput
                                    style={[styles.input, inputStyle]}
                                    placeholder="Auto from address"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
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
                                <Text style={[styles.label, { color: colors.textSecondary }]}>
                                    Longitude
                                </Text>
                                <TextInput
                                    style={[styles.input, inputStyle]}
                                    placeholder="Auto from address"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
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
                                style={[
                                    styles.error,
                                    {
                                        color: store.isGeocoding ? colors.info : colors.warning,
                                    },
                                ]}
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
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                Attachments
                            </Text>
                            <View style={styles.row}>
                                <Pressable
                                    style={[
                                        styles.secondaryBtn,
                                        {
                                            borderColor: colors.border,
                                            backgroundColor: colors.surface,
                                        },
                                    ]}
                                    onPress={handlePickImage}
                                >
                                    <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>
                                        Add image
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={[
                                        styles.secondaryBtn,
                                        {
                                            borderColor: colors.border,
                                            backgroundColor: colors.surface,
                                        },
                                    ]}
                                    onPress={handlePickDocument}
                                >
                                    <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>
                                        Add file
                                    </Text>
                                </Pressable>
                            </View>
                            <AttachmentList
                                attachments={store.pendingAttachments}
                                onDelete={att => store.removePendingAttachment(att.id)}
                                title=""
                            />
                        </View>

                        {store.submitError ? (
                            <Text style={[styles.error, { color: colors.danger }]}>
                                {store.submitError}
                            </Text>
                        ) : null}
                    </ScrollView>

                    <View
                        style={[
                            styles.footer,
                            { borderTopColor: colors.border, backgroundColor: colors.surface },
                        ]}
                    >
                        <Pressable
                            style={[
                                styles.primaryBtn,
                                { backgroundColor: colors.fab },
                                store.isSubmitting && styles.primaryBtnDisabled,
                            ]}
                            onPress={handleCreate}
                            disabled={store.isSubmitting}
                            accessibilityLabel="Create task"
                        >
                            {store.isSubmitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.primaryBtnText}>Create Task</Text>
                            )}
                        </Pressable>
                    </View>
                </SafeAreaView>
            </Modal>
        </>
    );
});

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 24,
        width: 58,
        height: 58,
        borderRadius: 29,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: '#0f172a',
        shadowOpacity: 0.25,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        zIndex: 20,
    },
    safe: { flex: 1 },
    header: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    headerEyebrow: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    headerTitle: { fontSize: 24, fontWeight: '700', marginTop: 2 },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: { padding: 20, gap: 16, paddingBottom: 32 },
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
    error: { fontSize: 12 },
    row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    secondaryBtn: {
        minHeight: 44,
        paddingHorizontal: 14,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryBtnText: { fontSize: 14, fontWeight: '600' },
    footer: {
        padding: 16,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    primaryBtn: {
        minHeight: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnDisabled: { opacity: 0.7 },
    primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
