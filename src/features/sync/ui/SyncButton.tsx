import { observer } from 'mobx-react-lite';
import { useSyncStore } from '../model/store';
import { RefreshCw } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useThemeColors } from '@/src/shared/theme';
import { IconButton } from '@/src/shared/ui';

export const SyncButton = observer(() => {
    const syncStore = useSyncStore();
    const colors = useThemeColors();

    return (
        <View style={styles.wrap}>
            <IconButton
                onPress={() => void syncStore.syncAll()}
                disabled={syncStore.isSyncing}
                accessibilityLabel="Sync tasks"
            >
                {syncStore.isSyncing ? (
                    <ActivityIndicator size="small" color={colors.text} />
                ) : (
                    <RefreshCw size={18} color={colors.text} strokeWidth={1.75} />
                )}
            </IconButton>
            {!syncStore.isOnline ? (
                <View style={[styles.offlineDot, { backgroundColor: colors.warning }]} />
            ) : null}
        </View>
    );
});

const styles = StyleSheet.create({
    wrap: { position: 'relative' },
    offlineDot: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 7,
        height: 7,
        borderRadius: 4,
    },
});
