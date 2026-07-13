import { useActionStore } from '../model/store';
import { observer } from 'mobx-react-lite';
import { ActionText } from './ActionText';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/src/shared/theme/useThemeColors';

type Props = { taskId: string };

export const ActionList = observer(({ taskId }: Props) => {
    const actionStore = useActionStore();
    const colors = useThemeColors();
    const actions = actionStore.getActionsByTaskId(taskId);

    return (
        <View
            style={[
                styles.wrap,
                { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
        >
            <Text style={[styles.title, { color: colors.textMuted }]}>History</Text>
            {actions.length === 0 ? (
                <Text style={[styles.empty, { color: colors.textMuted }]}>No history yet</Text>
            ) : (
                actions.map(action => <ActionText key={action.id} action={action} />)
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    wrap: {
        marginTop: 8,
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    title: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 6,
    },
    empty: {
        paddingHorizontal: 14,
        paddingBottom: 14,
        fontSize: 14,
    },
});
