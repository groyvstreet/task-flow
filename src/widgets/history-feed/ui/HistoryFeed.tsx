import { observer } from 'mobx-react-lite';
import { useActionStore, ActionText } from '@/src/entities/action';
import { ClearHistoryButton } from '@/src/features/clear-history';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { History } from 'lucide-react-native';
import { useThemeColors, Fonts } from '@/src/shared/theme';

export const HistoryFeed = observer(() => {
    const actionStore = useActionStore();
    const colors = useThemeColors();
    const actions = actionStore.sortedActions;

    return (
        <>
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <Text style={[styles.brand, { color: colors.text }]}>History</Text>
                    <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                        Recent activity
                    </Text>
                </View>
                <ClearHistoryButton />
            </View>

            {actionStore.isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : actions.length === 0 ? (
                <View style={styles.center}>
                    <History size={28} color={colors.textMuted} strokeWidth={1.5} />
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing yet</Text>
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                        Creates, edits, and sync events show up here
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={actions}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <ActionText action={item} showTaskTitle />}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </>
    );
});

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
    },
    headerText: { flex: 1, gap: 4 },
    brand: {
        fontSize: 32,
        fontFamily: Fonts.bold,
        letterSpacing: -0.8,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: Fonts.regular,
    },
    list: {
        paddingBottom: 32,
        paddingHorizontal: 8,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 8,
    },
    emptyTitle: {
        fontSize: 18,
        fontFamily: Fonts.semibold,
        marginTop: 8,
    },
    emptyText: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        textAlign: 'center',
        lineHeight: 20,
    },
});
