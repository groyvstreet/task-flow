import { Action, ACTION_TYPE_LABELS } from '../model/types';
import { formatDateTime } from '@/src/shared/lib/format';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/src/shared/theme/useThemeColors';
import { observer } from 'mobx-react-lite';

type Props = {
    action: Action;
    showTaskTitle?: boolean;
};

export const ActionText = observer(({ action, showTaskTitle = false }: Props) => {
    const colors = useThemeColors();

    return (
        <View style={[styles.row, { borderTopColor: colors.border }]}>
            <View style={styles.top}>
                <View style={[styles.badge, { backgroundColor: colors.surfaceMuted }]}>
                    <Text style={[styles.badgeText, { color: colors.textSecondary }]}>
                        {ACTION_TYPE_LABELS[action.type]}
                    </Text>
                </View>
                <Text style={[styles.time, { color: colors.textMuted }]}>
                    {formatDateTime(action.timestamp)}
                </Text>
            </View>
            {showTaskTitle && action.taskTitle ? (
                <Text style={[styles.taskTitle, { color: colors.text }]}>{action.taskTitle}</Text>
            ) : null}
            <Text style={[styles.description, { color: colors.textMuted }]}>
                {action.description}
            </Text>
        </View>
    );
});

const styles = StyleSheet.create({
    row: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderTopWidth: StyleSheet.hairlineWidth,
        gap: 4,
    },
    top: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    badge: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    badgeText: { fontSize: 11, fontWeight: '700' },
    time: { fontSize: 11 },
    taskTitle: { fontSize: 14, fontWeight: '700' },
    description: { fontSize: 13, lineHeight: 18 },
});
