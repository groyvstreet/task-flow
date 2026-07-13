import { observer } from 'mobx-react-lite';
import { useActionStore } from '@/src/entities/action';
import { ActionText } from '@/src/entities/action/ui/ActionText';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { History } from 'lucide-react-native';
import { useThemeColors } from '@/src/shared/theme/useThemeColors';

export const HistoryScreen = observer(() => {
    const actionStore = useActionStore();
    const colors = useThemeColors();
    const actions = actionStore.sortedActions;

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
            <View
                style={[
                    styles.header,
                    { backgroundColor: colors.surface, borderBottomColor: colors.border },
                ]}
            >
                <Text style={[styles.eyebrow, { color: colors.accent }]}>Audit</Text>
                <Text style={[styles.title, { color: colors.text }]}>Activity history</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    Creates, edits, status changes, attachments, and sync events
                </Text>
            </View>

            {actionStore.isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.accent} />
                </View>
            ) : actions.length === 0 ? (
                <View style={styles.center}>
                    <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
                        <History size={32} color={colors.accent} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.text }]}>No history yet</Text>
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                        Actions appear here as you create and update tasks
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={actions}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => <ActionText action={item} showTaskTitle />}
                    contentContainerStyle={{ backgroundColor: colors.surface, paddingBottom: 24 }}
                />
            )}
        </SafeAreaView>
    );
});

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        gap: 2,
    },
    eyebrow: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    title: { fontSize: 26, fontWeight: '800' },
    subtitle: { fontSize: 13, lineHeight: 18 },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        gap: 8,
    },
    iconWrap: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    emptyTitle: { fontSize: 18, fontWeight: '700' },
    emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
