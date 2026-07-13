import { Input, InputField } from '@/components/ui/input';
import ExpoDateTimePicker, { DateTimePickerChangeEvent } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';

type Props = {
    value: Date;
    onValueChange?: (date: Date) => any;
    minimumDate?: Date;
};

export const DateTimePicker = ({ value, onValueChange, minimumDate }: Props) => {
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const toggleVisibility = () => setIsPickerVisible(p => !p);

    const handleValueChange = (event: DateTimePickerChangeEvent, selectedDate: Date) => {
        toggleVisibility();
        onValueChange?.(selectedDate);
    };

    return (
        <>
            <Input>
                <InputField value={value.toDateString()} onPress={toggleVisibility} />
            </Input>
            {isPickerVisible && (
                <ExpoDateTimePicker
                    value={value}
                    onValueChange={handleValueChange}
                    onDismiss={toggleVisibility}
                    minimumDate={minimumDate}
                />
            )}
        </>
    );
};
