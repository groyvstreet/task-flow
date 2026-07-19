import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors, Fonts } from '@/src/shared/theme';
import { TextField } from './TextField';

type Props = {
    address: string;
    latitude?: number;
    longitude?: number;
    addressError?: string;
    addressLabel?: string;
    addressPlaceholder?: string;
    coordinatePlaceholder?: string;
    onAddressChange: (address: string) => void;
    onCoordinatesChange: (latitudeText: string, longitudeText: string) => void;
    isGeocoding?: boolean;
    geocodeHint?: string | null;
};

export const LocationFields = ({
    address,
    latitude,
    longitude,
    addressError,
    addressLabel = 'Address',
    addressPlaceholder = 'Street, city…',
    coordinatePlaceholder = 'Auto',
    onAddressChange,
    onCoordinatesChange,
    isGeocoding = false,
    geocodeHint = null,
}: Props) => {
    const colors = useThemeColors();
    const latText = latitude?.toString() ?? '';
    const lngText = longitude?.toString() ?? '';

    return (
        <View style={styles.wrap}>
            <TextField
                label={addressLabel}
                value={address}
                onChangeText={onAddressChange}
                error={addressError}
                placeholder={addressPlaceholder}
            />

            <View style={styles.row}>
                <TextField
                    label="Latitude"
                    value={latText}
                    onChangeText={v => onCoordinatesChange(v, lngText)}
                    placeholder={coordinatePlaceholder}
                    keyboardType="numeric"
                    style={styles.half}
                />
                <TextField
                    label="Longitude"
                    value={lngText}
                    onChangeText={v => onCoordinatesChange(latText, v)}
                    placeholder={coordinatePlaceholder}
                    keyboardType="numeric"
                    style={styles.half}
                />
            </View>

            {isGeocoding || geocodeHint ? (
                <Text
                    style={[
                        styles.hint,
                        { color: isGeocoding ? colors.info : colors.warning },
                    ]}
                >
                    {geocodeHint ?? 'Resolving location…'}
                </Text>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    wrap: { gap: 18 },
    row: { flexDirection: 'row', gap: 10 },
    half: { flex: 1 },
    hint: { fontSize: 12, fontFamily: Fonts.regular },
});
