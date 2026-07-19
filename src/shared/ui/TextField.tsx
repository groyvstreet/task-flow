import {
    StyleSheet,
    Text,
    TextInput,
    View,
    type KeyboardTypeOptions,
    type StyleProp,
    type ViewStyle,
} from 'react-native';
import { useThemeColors, Fonts } from '@/src/shared/theme';

type Props = {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    placeholder?: string;
    multiline?: boolean;
    keyboardType?: KeyboardTypeOptions;
    style?: StyleProp<ViewStyle>;
};

export const TextField = ({
    label,
    value,
    onChangeText,
    error,
    placeholder,
    multiline = false,
    keyboardType,
    style,
}: Props) => {
    const colors = useThemeColors();

    return (
        <View style={[styles.field, style]}>
            <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    multiline && styles.textarea,
                    {
                        borderColor: error ? colors.danger : colors.border,
                        backgroundColor: colors.inputBg,
                        color: colors.text,
                        fontFamily: Fonts.regular,
                    },
                ]}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                textAlignVertical={multiline ? 'top' : 'center'}
                keyboardType={keyboardType}
            />
            {error ? (
                <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    field: { gap: 8 },
    label: { fontSize: 12, fontFamily: Fonts.medium, letterSpacing: 0.2 },
    input: {
        minHeight: 50,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 14,
        paddingHorizontal: 14,
        fontSize: 16,
    },
    textarea: { minHeight: 110, paddingTop: 14, paddingBottom: 14 },
    error: { fontSize: 12, fontFamily: Fonts.regular },
});
