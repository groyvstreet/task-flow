import { useMemo, useState } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';
import { useThemeColors } from '@/src/shared/theme';
import { observer } from 'mobx-react-lite';

export type OptionPickerItem = {
    label: string;
    value: string;
    description?: string;
};

type Props = {
    label?: string;
    placeholder?: string;
    value: string;
    options: OptionPickerItem[];
    onChange: (value: string) => void;
    error?: string;
};

export const OptionPicker = observer(({
    label,
    placeholder = 'Select…',
    value,
    options,
    onChange,
    error,
}: Props) => {
    const [open, setOpen] = useState(false);
    const colors = useThemeColors();
    const selected = useMemo(
        () => options.find(o => o.value === value),
        [options, value],
    );

    return (
        <View style={styles.wrap}>
            {label ? (
                <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            ) : null}
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={label ?? placeholder}
                onPress={() => setOpen(true)}
                style={[
                    styles.trigger,
                    {
                        borderColor: error ? colors.danger : colors.border,
                        backgroundColor: colors.inputBg,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.triggerText,
                        { color: selected ? colors.text : colors.textMuted },
                    ]}
                    numberOfLines={1}
                >
                    {selected?.label ?? placeholder}
                </Text>
                <ChevronDown size={18} color={colors.textMuted} />
            </Pressable>
            {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <Pressable style={[styles.backdrop, { backgroundColor: colors.overlay }]} onPress={() => setOpen(false)}>
                    <Pressable
                        style={[styles.sheet, { backgroundColor: colors.surface }]}
                        onPress={e => e.stopPropagation()}
                    >
                        <Text style={[styles.sheetTitle, { color: colors.text }]}>
                            {label ?? 'Select option'}
                        </Text>
                        <ScrollView style={styles.list} keyboardShouldPersistTaps="handled">
                            {options.map(opt => {
                                const active = opt.value === value;
                                return (
                                    <Pressable
                                        key={opt.value}
                                        style={[
                                            styles.item,
                                            active && { backgroundColor: colors.accentSoft },
                                        ]}
                                        onPress={() => {
                                            onChange(opt.value);
                                            setOpen(false);
                                        }}
                                    >
                                        <View style={styles.itemTextWrap}>
                                            <Text
                                                style={[
                                                    styles.itemLabel,
                                                    {
                                                        color: active ? colors.accent : colors.text,
                                                        fontWeight: active ? '600' : '400',
                                                    },
                                                ]}
                                            >
                                                {opt.label}
                                            </Text>
                                            {opt.description ? (
                                                <Text style={[styles.itemDescription, { color: colors.textMuted }]}>
                                                    {opt.description}
                                                </Text>
                                            ) : null}
                                        </View>
                                        {active ? <Check size={18} color={colors.accent} /> : null}
                                    </Pressable>
                                );
                            })}
                        </ScrollView>
                        <Pressable
                            style={[styles.cancel, { backgroundColor: colors.surfaceMuted }]}
                            onPress={() => setOpen(false)}
                        >
                            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
                                Cancel
                            </Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
});

const styles = StyleSheet.create({
    wrap: { gap: 6 },
    label: { fontSize: 13, fontWeight: '600' },
    trigger: {
        minHeight: 50,
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 14,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    triggerText: { flex: 1, fontSize: 16 },
    error: { fontSize: 12 },
    backdrop: { flex: 1, justifyContent: 'flex-end' },
    sheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 16,
        paddingBottom: 24,
        maxHeight: '70%',
    },
    sheetTitle: {
        fontSize: 16,
        fontWeight: '700',
        paddingHorizontal: 20,
        marginBottom: 8,
    },
    list: { paddingHorizontal: 12 },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    itemTextWrap: { flex: 1, gap: 2 },
    itemLabel: { fontSize: 16 },
    itemDescription: { fontSize: 12 },
    cancel: {
        marginTop: 8,
        marginHorizontal: 16,
        minHeight: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: { fontSize: 16, fontWeight: '600' },
});
