import * as Location from 'expo-location';

export type GeocodeCoords = {
    latitude: number;
    longitude: number;
};

export class GeocodePermissionError extends Error {
    constructor(message = 'Location permission is required for address lookup') {
        super(message);
        this.name = 'GeocodePermissionError';
    }
}

const formatAddressParts = (place: Location.LocationGeocodedAddress): string => {
    if (place.formattedAddress?.trim()) {
        return place.formattedAddress.trim();
    }

    const street = [place.streetNumber, place.street].filter(Boolean).join(' ').trim();
    return [street, place.city, place.region, place.postalCode, place.country]
        .filter(Boolean)
        .join(', ');
};

/**
 * Android requires foreground location permission before geocodeAsync / reverseGeocodeAsync.
 * Docs: https://docs.expo.dev/versions/v56.0.0/sdk/location/
 */
export const ensureLocationPermission = async (): Promise<boolean> => {
    const current = await Location.getForegroundPermissionsAsync();
    if (current.status === Location.PermissionStatus.GRANTED) {
        return true;
    }

    const requested = await Location.requestForegroundPermissionsAsync();
    return requested.status === Location.PermissionStatus.GRANTED;
};

/** Address → coordinates via expo-location geocodeAsync */
export const geocodeAddress = async (address: string): Promise<GeocodeCoords | null> => {
    const query = address.trim();
    if (query.length < 3) return null;

    const allowed = await ensureLocationPermission();
    if (!allowed) {
        throw new GeocodePermissionError();
    }

    try {
        const results = await Location.geocodeAsync(query);
        const first = results[0];
        if (!first) return null;
        if (!Number.isFinite(first.latitude) || !Number.isFinite(first.longitude)) return null;
        return {
            latitude: first.latitude,
            longitude: first.longitude,
        };
    } catch (error) {
        if (error instanceof GeocodePermissionError) throw error;
        console.warn('geocodeAddress failed', error);
        return null;
    }
};

/** Coordinates → address via expo-location reverseGeocodeAsync */
export const reverseGeocodeCoords = async (
    latitude: number,
    longitude: number,
): Promise<string | null> => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;

    const allowed = await ensureLocationPermission();
    if (!allowed) {
        throw new GeocodePermissionError();
    }

    try {
        const results = await Location.reverseGeocodeAsync({ latitude, longitude });
        const first = results[0];
        if (!first) return null;
        const address = formatAddressParts(first);
        return address.length > 0 ? address : null;
    } catch (error) {
        if (error instanceof GeocodePermissionError) throw error;
        console.warn('reverseGeocodeCoords failed', error);
        return null;
    }
};
