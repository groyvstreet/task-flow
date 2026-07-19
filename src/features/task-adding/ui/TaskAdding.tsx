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
import { useTaskAddingStore } from '../model/store';
import { observer } from 'mobx-react-lite';
import { DateTimePicker, OptionPicker, toastStore } from '@/src/shared/ui';
import { Plus, X } from 'lucide-react-native';
import { AttachmentList, pickImage, pickDocument } from '@/src/entities/attachment';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TASK_STATUS_LABELS, type TaskStatus } from '@/src/entities/task';
import { useThemeColors, Fonts } from '@/src/shared/theme';

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
            toastStore.show(result.warning, 'warning', 5000);
        }
    };

    const inputStyle = {
        borderColor: colors.border,
        backgroundColor: colors.inputBg,
        color: colors.text,
        fontFamily: Fonts.regular,
    };

    return (
        <>
            <Pressable
                accessibilityLabel="Add new task"
                accessibilityRole="button"
                onPress={store.openModal}
                style={[styles.fab, { backgroundColor: colors.fab }]}
            >
                <Plus size={24} color={colors.onAccent} strokeWidth={2} />
            </Pressable>

            <Modal
                visible={store.isModalVisible}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={store.closeModal}
            >
                <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.headerTitle, { color: colors.text }]}>New task</Text>
                            <Text style={[styles.headerSub, { color: colors.textMuted }]}>
                                Add details and a place
                            </Text>
                        </View>
                        <Pressable
                            onPress={store.closeModal}
                            style={[styles.closeBtn, { backgroundColor: colors.surfaceMuted }]}
                            accessibilityLabel="Close"
                        >
                            <X size={20} color={colors.textSecondary} strokeWidth={1.75} />
                        </Pressable>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.content}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.textMuted }]}>Title</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    inputStyle,
                                    store.errors.title && { borderColor: colors.danger },
                                ]}
                                placeholder="What needs doing?"
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
                            <Text style={[styles.label, { color: colors.textMuted }]}>
                                Description
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    styles.textarea,
                                    inputStyle,
                                    store.errors.description && { borderColor: colors.danger },
                                ]}
                                placeholder="Notes for the site"
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
                            label="Due"
                            value={store.dueDate}
                            onValueChange={store.setDueDate}
                            minimumDate={new Date()}
                            error={store.errors.dueDate}
                        />

                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.textMuted }]}>Address</Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    inputStyle,
                                    store.errors.location && { borderColor: colors.danger },
                                ]}
                                placeholder="Street, city…"
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
                                <Text style={[styles.label, { color: colors.textMuted }]}>
                                    Latitude
                                </Text>
                                <TextInput
                                    style={[styles.input, inputStyle]}
                                    placeholder="Auto"
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
                                <Text style={[styles.label, { color: colors.textMuted }]}>
                                    Longitude
                                </Text>
                                <TextInput
                                    style={[styles.input, inputStyle]}
                                    placeholder="Auto"
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
                            <Text style={[styles.label, { color: colors.textMuted }]}>
                                Attachments
                            </Text>
                            <View style={styles.row}>
                                <Pressable
                                    style={[
                                        styles.secondaryBtn,
                                        { backgroundColor: colors.surfaceMuted },
                                    ]}
                                    onPress={handlePickImage}
                                >
                                    <Text
                                        style={[styles.secondaryBtnText, { color: colors.text }]}
                                    >
                                        Image
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={[
                                        styles.secondaryBtn,
                                        { backgroundColor: colors.surfaceMuted },
                                    ]}
                                    onPress={handlePickDocument}
                                >
                                    <Text
                                        style={[styles.secondaryBtnText, { color: colors.text }]}
                                    >
                                        File
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

                    <View style={[styles.footer, { backgroundColor: colors.bg }]}>
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
                                <ActivityIndicator color={colors.onAccent} />
                            ) : (
                                <Text style={[styles.primaryBtnText, { color: colors.onAccent }]}>
                                    Create
                                </Text>
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
        bottom: 22,
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
    },
    safe: { flex: 1 },
    header: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    headerTitle: {
        fontSize: 28,
        fontFamily: Fonts.bold,
        letterSpacing: -0.6,
    },
    headerSub: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        marginTop: 4,
    },
    closeBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: { paddingHorizontal: 24, gap: 18, paddingBottom: 32 },
    field: { gap: 8 },
    label: { fontSize: 12, fontFamily: Fonts.medium, letterSpacing: 0.2 },
    input: {
        minHeight: 50,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 14,
        paddingHorizontal: 14,
        fontSize: 16,
    },
    textarea: { minHeight: 110, paddingTop: 14, paddingBottom: 14 },
    error: { fontSize: 12, fontFamily: Fonts.regular },
    row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    secondaryBtn: {
        minHeight: 42,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    secondaryBtnText: { fontSize: 14, fontFamily: Fonts.medium },
    footer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    primaryBtn: {
        minHeight: 52,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryBtnDisabled: { opacity: 0.7 },
    primaryBtnText: { fontSize: 16, fontFamily: Fonts.semibold },
});
