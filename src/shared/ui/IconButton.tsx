import { type ReactNode } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useThemeColors } from '@/src/shared/theme';

type Props = {
    children: ReactNode;
    onPress?: () => void;
    accessibilityLabel?: string;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
};

export const IconButton = ({
    children,
    onPress,
    accessibilityLabel,
    disabled = false,
    style,
}: Props) => {
    const colors = useThemeColors();

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            onPress={onPress}
            disabled={disabled}
            style={[
                styles.btn,
                {
                    backgroundColor: colors.surfaceMuted,
                    opacity: disabled ? 0.45 : 1,
                },
                style,
            ]}
        >
            {children}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    btn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
