import { type ReactNode } from 'react';
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    type StyleProp,
    type TextStyle,
    type ViewStyle,
} from 'react-native';
import { useThemeColors, Fonts } from '@/src/shared/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'dangerSoft' | 'ghost';

type Props = {
    children?: ReactNode;
    onPress?: () => void;
    variant?: ButtonVariant;
    loading?: boolean;
    disabled?: boolean;
    icon?: ReactNode;
    accessibilityLabel?: string;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
};

export const Button = ({
    children,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    icon,
    accessibilityLabel,
    style,
    textStyle,
}: Props) => {
    const colors = useThemeColors();
    const isDisabled = disabled || loading;

    const palette =
        variant === 'primary'
            ? { bg: colors.fab, text: colors.onAccent, spinner: colors.onAccent }
            : variant === 'secondary'
              ? { bg: colors.surfaceMuted, text: colors.text, spinner: colors.text }
              : variant === 'danger'
                ? { bg: colors.danger, text: '#FFFFFF', spinner: '#FFFFFF' }
                : variant === 'dangerSoft'
                  ? { bg: colors.dangerBg, text: colors.danger, spinner: colors.danger }
                  : { bg: 'transparent', text: colors.textSecondary, spinner: colors.textSecondary };

    const label =
        typeof children === 'string' || typeof children === 'number' ? (
            <Text style={[styles.text, { color: palette.text }, textStyle]}>{children}</Text>
        ) : (
            children
        );

    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            onPress={onPress}
            disabled={isDisabled}
            style={[
                styles.base,
                { backgroundColor: palette.bg, opacity: isDisabled ? 0.7 : 1 },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={palette.spinner} />
            ) : (
                <>
                    {icon}
                    {label}
                </>
            )}
        </Pressable>
    );
};

const styles = StyleSheet.create({
    base: {
        minHeight: 48,
        paddingHorizontal: 16,
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    text: {
        fontSize: 15,
        fontFamily: Fonts.semibold,
    },
});
