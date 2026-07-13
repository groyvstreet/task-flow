import { Link, Stack } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/src/shared/theme/useThemeColors';

export default function NotFoundScreen() {
    const colors = useThemeColors();

    return (
        <>
            <Stack.Screen options={{ title: 'Oops!' }} />
            <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
                <Text style={[styles.title, { color: colors.text }]}>This screen doesn't exist.</Text>
                <Link href="/" asChild>
                    <Pressable>
                        <Text style={[styles.link, { color: colors.accent }]}>Go to home screen</Text>
                    </Pressable>
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        gap: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    link: {
        fontSize: 15,
        fontWeight: '700',
        marginTop: 8,
    },
});
