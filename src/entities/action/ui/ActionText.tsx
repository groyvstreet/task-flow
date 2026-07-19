import { Action, ACTION_TYPE_LABELS } from '../model/types';
import { formatDateTime } from '@/src/shared/lib';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors, Fonts } from '@/src/shared/theme';
import { observer } from 'mobx-react-lite';

type Props = {
    action: Action;
    showTaskTitle?: boolean;
};

export const ActionText = observer(({ action, showTaskTitle = false }: Props) => {
    const colors = useThemeColors();

    return (
        <View style={[styles.row, { borderBottomColor: colors.border }]}>
            <View style={styles.top}>
                <Text style={[styles.badgeText, { color: colors.textMuted }]}>
                    {ACTION_TYPE_LABELS[action.type]}
                </Text>
                <Text style={[styles.time, { color: colors.textMuted }]}>
                    {formatDateTime(action.timestamp)}
                </Text>
            </View>
            {showTaskTitle && action.taskTitle ? (
                <Text style={[styles.taskTitle, { color: colors.text }]}>{action.taskTitle}</Text>
            ) : null}
            <Text style={[styles.description, { color: colors.textSecondary }]}>
                {action.description}
            </Text>
        </View>
    );
});

const styles = StyleSheet.create({
    row: {
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 4,
    },
    top: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    badgeText: {
        fontSize: 11,
        fontFamily: Fonts.semibold,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    time: { fontSize: 11, fontFamily: Fonts.regular },
    taskTitle: { fontSize: 15, fontFamily: Fonts.semibold, letterSpacing: -0.2 },
    description: { fontSize: 13, fontFamily: Fonts.regular, lineHeight: 18 },
});
