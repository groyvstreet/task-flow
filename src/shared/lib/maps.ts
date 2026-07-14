import Constants from 'expo-constants';

const PLACEHOLDER_MARKERS = ['YOUR_GOOGLE_MAPS', 'YOUR_', 'REPLACE_ME'];

const isRealKey = (key?: string | null): key is string => {
    if (!key || typeof key !== 'string') return false;
    if (key.length < 20) return false;
    return !PLACEHOLDER_MARKERS.some(marker => key.includes(marker));
};

export const getGoogleMapsApiKey = (): string | null => {
    const extra = Constants.expoConfig?.extra as { googleMapsApiKey?: string } | undefined;
    const candidates = [
        extra?.googleMapsApiKey,
        Constants.expoConfig?.android?.config?.googleMaps?.apiKey,
        Constants.expoConfig?.ios?.config?.googleMapsApiKey,
    ];

    for (const key of candidates) {
        if (isRealKey(key)) return key;
    }
    return null;
};

export const isGoogleMapsConfigured = (): boolean => getGoogleMapsApiKey() != null;
