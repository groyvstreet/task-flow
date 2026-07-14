type SyncTrigger = () => void;

let trigger: SyncTrigger | null = null;

export const registerAutoSyncTrigger = (fn: SyncTrigger) => {
    trigger = fn;
};

export const requestAutoSync = () => {
    trigger?.();
};
