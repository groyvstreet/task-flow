import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, Trash2 } from 'lucide-react-native';
import { useActionStore } from '@/src/entities/action';
import { useThemeColors, Fonts } from '@/src/shared/theme';
import { toastStore } from '@/src/shared/ui';

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
            <Pressable
                style={[
                    styles.btn,
                    { backgroundColor: colors.surfaceMuted, opacity: disabled ? 0.45 : 1 },
                ]}
                onPress={() => setVisible(true)}
                disabled={disabled}
                accessibilityLabel="Clear history"
            >
                <Trash2 size={18} color={colors.danger} strokeWidth={1.75} />
            </Pressable>

            <Modal
                transparent
                visible={visible}
                animationType="fade"
                onRequestClose={() => setVisible(false)}
            >
                <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
                    <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
                        <AlertTriangle size={24} color={colors.danger} strokeWidth={1.75} />
                        <Text style={[styles.title, { color: colors.text }]}>Clear history?</Text>
                        <Text style={[styles.body, { color: colors.textMuted }]}>
                            Removes all activity entries from this device and queues a wipe on the
                            server.
                        </Text>
                        <View style={styles.actions}>
                            <Pressable
                                style={[styles.cancel, { backgroundColor: colors.surfaceMuted }]}
                                onPress={() => setVisible(false)}
                                disabled={clearing}
                            >
                                <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[styles.confirm, { backgroundColor: colors.danger }]}
                                onPress={() => void handleClear()}
                                disabled={clearing}
                            >
                                {clearing ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.confirmText}>Clear</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
});

const styles = StyleSheet.create({
    btn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backdrop: {
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
    title: {
        fontSize: 18,
        fontFamily: Fonts.semibold,
    },
    body: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        textAlign: 'center',
        lineHeight: 20,
    },
    actions: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
        width: '100%',
    },
    cancel: {
        flex: 1,
        minHeight: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: { fontFamily: Fonts.medium },
    confirm: {
        flex: 1,
        minHeight: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmText: {
        fontFamily: Fonts.semibold,
        color: '#fff',
    },
});
