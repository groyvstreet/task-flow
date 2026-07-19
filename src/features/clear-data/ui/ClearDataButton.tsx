import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Trash2 } from 'lucide-react-native';
import { useTaskStore } from '@/src/entities/task';
import { useActionStore } from '@/src/entities/action';
import { useAttachmentStore } from '@/src/entities/attachment';
import { useThemeColors } from '@/src/shared/theme';
import { ConfirmDialog, IconButton, toastStore } from '@/src/shared/ui';

export const ClearDataButton = observer(() => {
    const taskStore = useTaskStore();
    const actionStore = useActionStore();
    const attachmentStore = useAttachmentStore();
    const colors = useThemeColors();
    const [visible, setVisible] = useState(false);
    const [clearing, setClearing] = useState(false);

    const handleClear = async () => {
        if (clearing) return;
        setClearing(true);
        try {
            await taskStore.clearAll();
            await attachmentStore.clearAll();
            await actionStore.clearAll();
            setVisible(false);
            toastStore.show('All local data deleted', 'success');
        } catch (error) {
            console.error('Failed to clear data', error);
            toastStore.show('Failed to delete data', 'error');
        } finally {
            setClearing(false);
        }
    };

    return (
        <>
            <IconButton onPress={() => setVisible(true)} accessibilityLabel="Delete all data">
                <Trash2 size={18} color={colors.danger} strokeWidth={1.75} />
            </IconButton>

            <ConfirmDialog
                visible={visible}
                title="Delete all data?"
                message="Removes every task, attachment, and history entry from this device. Synced tasks will also be queued for delete on the server."
                confirmLabel="Delete all"
                loading={clearing}
                onCancel={() => setVisible(false)}
                onConfirm={() => void handleClear()}
            />
        </>
    );
});
