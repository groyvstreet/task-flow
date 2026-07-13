import { makeAutoObservable, runInAction } from 'mobx';
import { TaskLocation } from '@/src/entities/task/model/types';
import {
    GeocodePermissionError,
    geocodeAddress,
    reverseGeocodeCoords,
} from '@/src/shared/lib/geocoding';

const DEBOUNCE_MS = 700;

/**
 * Shared address ↔ coordinates sync for create/edit forms.
 * Uses expo-location geocodeAsync / reverseGeocodeAsync with debounce + loop guards.
 */
export class LocationFormHelper {
    location: TaskLocation = { address: '' };
    isGeocoding = false;
    geocodeHint: string | null = null;

    private addressTimer: ReturnType<typeof setTimeout> | null = null;
    private coordsTimer: ReturnType<typeof setTimeout> | null = null;
    private addressRequestId = 0;
    private coordsRequestId = 0;
    /** Skip reverse when coords were filled by geocode; skip geocode when address filled by reverse */
    private suppressGeocode = false;
    private suppressReverse = false;

    constructor() {
        makeAutoObservable(this);
    }

    resetLocation = (location: TaskLocation = { address: '' }) => {
        this.clearTimers();
        this.location = { ...location };
        this.isGeocoding = false;
        this.geocodeHint = null;
        this.suppressGeocode = false;
        this.suppressReverse = false;
    };

    private clearTimers = () => {
        if (this.addressTimer) clearTimeout(this.addressTimer);
        if (this.coordsTimer) clearTimeout(this.coordsTimer);
        this.addressTimer = null;
        this.coordsTimer = null;
    };

    setLocationAddress = (address: string) => {
        this.location = { ...this.location, address };
        this.geocodeHint = null;

        if (this.suppressGeocode) {
            this.suppressGeocode = false;
            return;
        }

        if (this.addressTimer) clearTimeout(this.addressTimer);
        const requestId = ++this.addressRequestId;

        this.addressTimer = setTimeout(() => {
            void this.runGeocode(address, requestId);
        }, DEBOUNCE_MS);
    };

    /**
     * Partial coordinate edits (string inputs). Reverse-geocodes when both values are valid numbers.
     */
    setLocationCoordinateFields = (latitudeText: string, longitudeText: string) => {
        const lat = parseFloat(latitudeText);
        const lng = parseFloat(longitudeText);

        const next: TaskLocation = {
            ...this.location,
            latitude: latitudeText.trim() === '' || Number.isNaN(lat) ? undefined : lat,
            longitude: longitudeText.trim() === '' || Number.isNaN(lng) ? undefined : lng,
        };
        this.location = next;
        this.geocodeHint = null;

        if (this.suppressReverse) {
            this.suppressReverse = false;
            return;
        }

        if (
            next.latitude == null ||
            next.longitude == null ||
            Number.isNaN(next.latitude) ||
            Number.isNaN(next.longitude)
        ) {
            return;
        }

        if (this.coordsTimer) clearTimeout(this.coordsTimer);
        const requestId = ++this.coordsRequestId;
        const { latitude, longitude } = next;

        this.coordsTimer = setTimeout(() => {
            void this.runReverseGeocode(latitude!, longitude!, requestId);
        }, DEBOUNCE_MS);
    };

    setLocationCoordinates = (latitude: number, longitude: number) => {
        this.setLocationCoordinateFields(String(latitude), String(longitude));
    };

    private permissionDeniedHint =
        'Allow location access in system settings to look up addresses.';

    private runGeocode = async (address: string, requestId: number) => {
        const query = address.trim();
        if (query.length < 3) return;

        runInAction(() => {
            this.isGeocoding = true;
            this.geocodeHint = 'Looking up coordinates…';
        });

        try {
            const coords = await geocodeAddress(query);
            if (requestId !== this.addressRequestId) return;

            runInAction(() => {
                this.isGeocoding = false;
                if (!coords) {
                    this.geocodeHint =
                        'Address not found. Enter coordinates manually.';
                    return;
                }
                this.suppressReverse = true;
                this.location = {
                    ...this.location,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                };
                this.geocodeHint = null;
            });
        } catch (error) {
            if (requestId !== this.addressRequestId) return;
            runInAction(() => {
                this.isGeocoding = false;
                this.geocodeHint =
                    error instanceof GeocodePermissionError
                        ? this.permissionDeniedHint
                        : 'Address lookup failed. Try again or enter coordinates manually.';
            });
        }
    };

    private runReverseGeocode = async (
        latitude: number,
        longitude: number,
        requestId: number,
    ) => {
        runInAction(() => {
            this.isGeocoding = true;
            this.geocodeHint = 'Looking up address…';
        });

        try {
            const address = await reverseGeocodeCoords(latitude, longitude);
            if (requestId !== this.coordsRequestId) return;

            runInAction(() => {
                this.isGeocoding = false;
                if (!address) {
                    this.geocodeHint = 'No address found for these coordinates.';
                    return;
                }
                this.suppressGeocode = true;
                this.location = {
                    ...this.location,
                    address,
                };
                this.geocodeHint = null;
            });
        } catch (error) {
            if (requestId !== this.coordsRequestId) return;
            runInAction(() => {
                this.isGeocoding = false;
                this.geocodeHint =
                    error instanceof GeocodePermissionError
                        ? this.permissionDeniedHint
                        : 'Address lookup failed. Try again or enter coordinates manually.';
            });
        }
    };
}
