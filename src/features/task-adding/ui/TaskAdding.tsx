import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTaskAddingStore } from '../model/store';
import { observer } from 'mobx-react-lite';
import {
    Button,
    DateTimePicker,
    IconButton,
    LocationFields,
    OptionPicker,
    TextField,
    toastStore,
} from '@/src/shared/ui';
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
                        <IconButton onPress={store.closeModal} accessibilityLabel="Close">
                            <X size={20} color={colors.textSecondary} strokeWidth={1.75} />
                        </IconButton>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.content}
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                    >
                        <TextField
                            label="Title"
                            value={store.title}
                            onChangeText={store.setTitle}
                            error={store.errors.title}
                            placeholder="What needs doing?"
                        />

                        <TextField
                            label="Description"
                            value={store.description}
                            onChangeText={store.setDescription}
                            error={store.errors.description}
                            placeholder="Notes for the site"
                            multiline
                        />

                        <DateTimePicker
                            label="Due"
                            value={store.dueDate}
                            onValueChange={store.setDueDate}
                            minimumDate={new Date()}
                            error={store.errors.dueDate}
                        />

                        <LocationFields
                            address={store.location.address}
                            latitude={store.location.latitude}
                            longitude={store.location.longitude}
                            addressError={store.errors.location}
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
                            <Text style={[styles.label, { color: colors.textMuted }]}>
                                Attachments
                            </Text>
                            <View style={styles.row}>
                                <Button variant="secondary" onPress={handlePickImage}>
                                    Image
                                </Button>
                                <Button variant="secondary" onPress={handlePickDocument}>
                                    File
                                </Button>
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
                        <Button
                            onPress={handleCreate}
                            loading={store.isSubmitting}
                            accessibilityLabel="Create task"
                            style={styles.footerBtn}
                            textStyle={{ fontSize: 16 }}
                        >
                            Create
                        </Button>
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
    content: { paddingHorizontal: 24, gap: 18, paddingBottom: 32 },
    field: { gap: 8 },
    label: { fontSize: 12, fontFamily: Fonts.medium, letterSpacing: 0.2 },
    error: { fontSize: 12, fontFamily: Fonts.regular },
    row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
    footer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
    },
    footerBtn: {
        minHeight: 52,
        borderRadius: 16,
    },
});
