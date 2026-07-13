import { StyleSheet, Text, View } from 'react-native';
import { TaskStatus, TASK_STATUS_LABELS } from '@/src/entities/task/model/types';
import { useThemeColors } from '@/src/shared/theme/useThemeColors';
import { observer } from 'mobx-react-lite';

type Props = { status: TaskStatus };

export const TaskStatusBadge = observer(({ status }: Props) => {
    const colors = useThemeColors();
    const palette =
        status === 'new'
            ? { bg: colors.infoBg, text: colors.info }
            : status === 'in-progress'
              ? { bg: colors.warningBg, text: colors.warning }
              : status === 'completed'
                ? { bg: colors.successBg, text: colors.success }
                : { bg: colors.surfaceMuted, text: colors.textMuted };

    return (
        <View style={[styles.badge, { backgroundColor: palette.bg }]}>
            <Text style={[styles.text, { color: palette.text }]}>{TASK_STATUS_LABELS[status]}</Text>
        </View>
    );
});

const styles = StyleSheet.create({
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
    text: { fontSize: 12, fontWeight: '700' },
});
