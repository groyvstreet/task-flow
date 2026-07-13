import { observer } from 'mobx-react-lite';
import { useSyncStore } from '../model/store';
import { RefreshCw } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/src/shared/theme/useThemeColors';

export const SyncButton = observer(() => {
    const syncStore = useSyncStore();
    const colors = useThemeColors();

    return (
        <View style={styles.wrap}>
            <Pressable
                style={[
                    styles.btn,
                    {
                        borderColor: colors.accentBorder,
                        backgroundColor: colors.accentSoft,
                    },
                ]}
                onPress={syncStore.syncAll}
                disabled={syncStore.isSyncing}
                accessibilityLabel="Sync tasks"
            >
                {syncStore.isSyncing ? (
                    <ActivityIndicator size="small" color={colors.accent} />
                ) : (
                    <RefreshCw size={16} color={colors.accent} />
                )}
                <Text style={[styles.btnText, { color: colors.accent }]}>Sync</Text>
            </Pressable>
            {!syncStore.isOnline ? (
                <View style={[styles.offlineDot, { backgroundColor: colors.warning }]} />
            ) : null}
        </View>
    );
});

const styles = StyleSheet.create({
    wrap: {
        position: 'relative',
    },
    btn: {
        minHeight: 40,
        paddingHorizontal: 12,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    btnText: {
        fontSize: 13,
        fontWeight: '700',
    },
    offlineDot: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 8,
        height: 8,
        borderRadius: 4,
    },
});
