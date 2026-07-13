import { StyleSheet, Text, View } from 'react-native';
import { SyncStatus, SYNC_STATUS_LABELS } from '@/src/entities/task/model/types';
import { useThemeColors } from '@/src/shared/theme/useThemeColors';
import { observer } from 'mobx-react-lite';

type Props = { status: SyncStatus };

export const SyncStatusBadge = observer(({ status }: Props) => {
    const colors = useThemeColors();
    const palette =
        status === 'pending'
            ? { bg: colors.warningBg, text: colors.warning }
            : status === 'synced'
              ? { bg: colors.successBg, text: colors.success }
              : { bg: colors.dangerBg, text: colors.danger };

    return (
        <View style={[styles.badge, { backgroundColor: palette.bg }]}>
            <Text style={[styles.text, { color: palette.text }]}>{SYNC_STATUS_LABELS[status]}</Text>
        </View>
    );
});

const styles = StyleSheet.create({
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    text: { fontSize: 11, fontWeight: '600' },
});
