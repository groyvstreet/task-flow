import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { Trash2 } from 'lucide-react-native';
import { useActionStore } from '@/src/entities/action';
import { useThemeColors } from '@/src/shared/theme';
import { ConfirmDialog, IconButton, toastStore } from '@/src/shared/ui';

export const ClearHistoryButton = observer(() => {
    const actionStore = useActionStore();
    const colors = useThemeColors();
    const [visible, setVisible] = useState(false);
    const [clearing, setClearing] = useState(false);

    const disabled = actionStore.actions.length === 0 && !actionStore.historyClearPending;

    const handleClear = async () => {
        if (clearing) return;
        setClearing(true);
        try {
            await actionStore.clearAll();
            setVisible(false);
            toastStore.show('History cleared', 'success');
        } catch (error) {
            console.error('Failed to clear history', error);
            toastStore.show('Failed to clear history', 'error');
        } finally {
            setClearing(false);
        }
    };

    return (
        <>
            <IconButton
                onPress={() => setVisible(true)}
                disabled={disabled}
                accessibilityLabel="Clear history"
            >
                <Trash2 size={18} color={colors.danger} strokeWidth={1.75} />
            </IconButton>

            <ConfirmDialog
                visible={visible}
                title="Clear history?"
                message="Removes all activity entries from this device and queues a wipe on the server."
                confirmLabel="Clear"
                loading={clearing}
                onCancel={() => setVisible(false)}
                onConfirm={() => void handleClear()}
            />
        </>
    );
});
