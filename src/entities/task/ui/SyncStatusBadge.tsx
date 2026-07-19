import { StyleSheet, Text, View } from 'react-native';
import { SyncStatus, SYNC_STATUS_LABELS } from '../model/types';
import { useThemeColors, Fonts } from '@/src/shared/theme';
import { observer } from 'mobx-react-lite';

type Props = { status: SyncStatus };

export const SyncStatusBadge = observer(({ status }: Props) => {
    const colors = useThemeColors();
    const palette =
        status === 'pending'
            ? { bg: colors.warningBg, text: colors.warning }
            : status === 'synced'
              ? { bg: colors.surfaceMuted, text: colors.textMuted }
              : { bg: colors.dangerBg, text: colors.danger };

    return (
        <View style={[styles.badge, { backgroundColor: palette.bg }]}>
            <Text style={[styles.text, { color: palette.text }]}>{SYNC_STATUS_LABELS[status]}</Text>
        </View>
    );
});

const styles = StyleSheet.create({
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    text: { fontSize: 11, fontFamily: Fonts.medium },
});
