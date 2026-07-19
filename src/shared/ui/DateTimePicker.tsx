import { useState } from 'react';
import {
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import RNDateTimePicker, {
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { CalendarClock } from 'lucide-react-native';
import { format } from 'date-fns';
import { useThemeColors } from '@/src/shared/theme';
import { observer } from 'mobx-react-lite';

type Props = {
    value: Date;
    onValueChange: (date: Date) => void;
    minimumDate?: Date;
    label?: string;
    error?: string;
};

export const DateTimePicker = observer(({
    value,
    onValueChange,
    minimumDate,
    label,
    error,
}: Props) => {
    const colors = useThemeColors();
    const [mode, setMode] = useState<'date' | 'time' | null>(null);
    const [tempDate, setTempDate] = useState(value);

    const open = (next: 'date' | 'time') => {
        setTempDate(value);
        setMode(next);
    };

    const applyAndroid = (event: DateTimePickerEvent, selected?: Date) => {
        if (event.type === 'dismissed') {
            setMode(null);
            return;
        }
        if (!selected) {
            setMode(null);
            return;
        }

        if (mode === 'date') {
            const merged = new Date(value);
            merged.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
            onValueChange(merged);
            setMode('time');
            return;
        }

        const merged = new Date(value);
        merged.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
        onValueChange(merged);
        setMode(null);
    };

    const applyIos = (_event: DateTimePickerEvent, selected?: Date) => {
        if (selected) setTempDate(selected);
    };

    const confirmIos = () => {
        onValueChange(tempDate);
        setMode(null);
    };

    return (
        <View style={styles.wrap}>
            {label ? (
                <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            ) : null}
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={label ?? 'Pick date and time'}
                onPress={() => open('date')}
                style={[
                    styles.trigger,
                    {
                        borderColor: error ? colors.danger : colors.border,
                        backgroundColor: colors.inputBg,
                    },
                ]}
            >
                <CalendarClock size={18} color={colors.textMuted} strokeWidth={1.75} />
                <Text style={[styles.triggerText, { color: colors.text }]}>
                    {format(value, 'dd MMM yyyy, HH:mm')}
                </Text>
            </Pressable>
            {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}

            {Platform.OS === 'android' && mode ? (
                <RNDateTimePicker
                    value={value}
                    mode={mode}
                    display="default"
                    minimumDate={minimumDate}
                    onChange={applyAndroid}
                />
            ) : null}

            {Platform.OS === 'ios' && mode ? (
                <Modal transparent animationType="slide" visible onRequestClose={() => setMode(null)}>
                    <View style={[styles.iosBackdrop, { backgroundColor: colors.overlay }]}>
                        <View style={[styles.iosSheet, { backgroundColor: colors.surface }]}>
                            <View style={[styles.iosHeader, { borderBottomColor: colors.border }]}>
                                <Pressable onPress={() => setMode(null)}>
                                    <Text style={{ fontSize: 16, color: colors.textMuted }}>Cancel</Text>
                                </Pressable>
                                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
                                    Due date & time
                                </Text>
                                <Pressable onPress={confirmIos}>
                                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.accent }}>
                                        Done
                                    </Text>
                                </Pressable>
                            </View>
                            <RNDateTimePicker
                                value={tempDate}
                                mode="datetime"
                                display="spinner"
                                minimumDate={minimumDate}
                                onChange={applyIos}
                                style={{ alignSelf: 'center' }}
                            />
                        </View>
                    </View>
                </Modal>
            ) : null}
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
        gap: 10,
    },
    triggerText: { fontSize: 16 },
    error: { fontSize: 12 },
    iosBackdrop: { flex: 1, justifyContent: 'flex-end' },
    iosSheet: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 24,
    },
    iosHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
});
