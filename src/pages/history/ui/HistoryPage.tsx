import { HistoryFeed } from '@/src/widgets/history-feed';
import { useThemeColors } from '@/src/shared/theme';
import { observer } from 'mobx-react-lite';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const HistoryPage = observer(() => {
    const colors = useThemeColors();

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
            <HistoryFeed />
        </SafeAreaView>
    );
});

const styles = StyleSheet.create({
    safe: { flex: 1 },
});
