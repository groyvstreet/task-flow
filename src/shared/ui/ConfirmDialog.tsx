import { type ReactNode } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { useThemeColors, Fonts } from '@/src/shared/theme';
import { Button } from './Button';

type Props = {
    visible: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
    showIcon?: boolean;
    icon?: ReactNode;
};

export const ConfirmDialog = ({
    visible,
    title,
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    loading = false,
    showIcon = true,
    icon,
}: Props) => {
    const colors = useThemeColors();

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
                <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
                    {showIcon
                        ? (icon ?? (
                              <AlertTriangle size={24} color={colors.danger} strokeWidth={1.75} />
                          ))
                        : null}
                    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                    <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
                    <View style={styles.actions}>
                        <Button
                            variant="secondary"
                            onPress={onCancel}
                            disabled={loading}
                            style={styles.actionBtn}
                            textStyle={{ color: colors.textSecondary, fontFamily: Fonts.medium }}
                        >
                            {cancelLabel}
                        </Button>
                        <Button
                            variant="danger"
                            onPress={onConfirm}
                            loading={loading}
                            style={styles.actionBtn}
                        >
                            {confirmLabel}
                        </Button>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
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
        textAlign: 'center',
    },
    message: {
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
    actionBtn: {
        flex: 1,
        minHeight: 48,
    },
});
