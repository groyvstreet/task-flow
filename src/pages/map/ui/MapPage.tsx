import { MapPanel } from '@/src/widgets/map-panel';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors, Fonts } from '@/src/shared/theme';
import { observer } from 'mobx-react-lite';

export const MapPage = observer(() => {
    const colors = useThemeColors();

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
            <View style={styles.header}>
                <Text style={[styles.brand, { color: colors.text }]}>Map</Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                    Tasks with a location
                </Text>
            </View>
            <MapPanel />
        </SafeAreaView>
    );
});

const styles = StyleSheet.create({
    safe: { flex: 1 },
    header: {
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 12,
        gap: 4,
    },
    brand: {
        fontSize: 32,
        fontFamily: Fonts.bold,
        letterSpacing: -0.8,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: Fonts.regular,
    },
});
