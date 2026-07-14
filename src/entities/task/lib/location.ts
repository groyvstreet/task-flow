import { TaskLocation } from '../model/types';

export const normalizeTaskLocation = (location: unknown): TaskLocation => {
    if (typeof location === 'string') {
        return { address: location };
    }
    if (location && typeof location === 'object') {
        const loc = location as TaskLocation;
        return {
            address: typeof loc.address === 'string' ? loc.address : '',
            latitude: typeof loc.latitude === 'number' ? loc.latitude : undefined,
            longitude: typeof loc.longitude === 'number' ? loc.longitude : undefined,
        };
    }
    return { address: '' };
};

export const mergeTaskLocation = (local: TaskLocation, remote: TaskLocation): TaskLocation => {
    const address = remote.address?.trim() ? remote.address : local.address;
    return {
        address,
        latitude: remote.latitude ?? local.latitude,
        longitude: remote.longitude ?? local.longitude,
    };
};
