import { makeAutoObservable, runInAction } from 'mobx';
import { createContext, useContext } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { syncService } from '@/src/shared/api/sync-service';
import { registerAutoSyncTrigger } from '@/src/shared/api/auto-sync';
import { taskStore } from '@/src/entities/task/model/store';
import { actionStore } from '@/src/entities/action/model/store';
import { attachmentStore } from '@/src/entities/attachment/model/store';
import { toastStore } from '@/src/shared/ui/toastStore';

type SyncOptions = {
    quiet?: boolean;
    silentErrors?: boolean;
};

const AUTO_SYNC_DEBOUNCE_MS = 400;

const isConnected = (state: NetInfoState): boolean => {
    if (state.isConnected === false) return false;
    if (state.isInternetReachable === false) return false;
    return state.isConnected === true;
};

export class SyncStore {
    isSyncing = false;
    isOnline = false;
    lastSyncAt: number | null = null;
    lastError: string | null = null;

    private initialNetworkResolved = false;
    private networkReady: Promise<boolean>;
    private autoSyncTimer: ReturnType<typeof setTimeout> | null = null;

    constructor() {
        makeAutoObservable(this, {
            networkReady: false,
            autoSyncTimer: false,
        });
        this.networkReady = this.setupNetworkListener();
        registerAutoSyncTrigger(() => this.requestSync());
    }

    private setupNetworkListener = (): Promise<boolean> => {
        const initial = NetInfo.fetch().then(state => {
            const online = isConnected(state);
            runInAction(() => {
                this.isOnline = online;
                this.initialNetworkResolved = true;
            });
            return online;
        });

        NetInfo.addEventListener(state => {
            const online = isConnected(state);
            const wasOffline = !this.isOnline;

            runInAction(() => {
                this.isOnline = online;
            });

            if (this.initialNetworkResolved && online && wasOffline) {
                void this.syncAll();
            }
        });

        return initial;
    };

    hydrateOnLaunch = async () => {
        const online = await this.networkReady.catch(() => false);
        if (!online) return;
        await this.syncAll();
    };

    requestSync = () => {
        if (!this.isOnline) return;
        if (this.autoSyncTimer) clearTimeout(this.autoSyncTimer);
        this.autoSyncTimer = setTimeout(() => {
            this.autoSyncTimer = null;
            if (!this.isOnline || this.isSyncing) return;
            void this.syncAll({ quiet: true });
        }, AUTO_SYNC_DEBOUNCE_MS);
    };

    syncAll = async (options: SyncOptions = {}) => {
        if (this.isSyncing) return;

        runInAction(() => {
            this.isSyncing = true;
            this.lastError = null;
        });

        try {
            const online = await syncService.isOnline();
            if (!online) {
                const message = 'Server is not reachable. Changes saved locally.';
                runInAction(() => {
                    this.lastError = message;
                    this.isOnline = false;
                    this.isSyncing = false;
                });
                if (!options.silentErrors) {
                    toastStore.show(message, 'warning');
                }
                return;
            }

            runInAction(() => {
                this.isOnline = true;
            });

            const pendingIds = taskStore.tasks
                .filter(t => t.syncStatus === 'pending')
                .map(t => t.id);
            const deletedIds = [...taskStore.deletedTaskIds];
            const unsyncedActions = actionStore.unsyncedActions;
            const hadLocalTasks = taskStore.tasks.length > 0;
            const hadWork =
                pendingIds.length > 0 ||
                deletedIds.length > 0 ||
                unsyncedActions.length > 0;

            if (deletedIds.length > 0) {
                await syncService.syncDeletedTasks(deletedIds);
                await taskStore.markDeletedSynced(deletedIds);
            }

            await syncService.syncTasks(taskStore.tasks);
            const syncedActions = await syncService.syncActions(unsyncedActions);
            await actionStore.markActionsSynced(syncedActions.map(a => a.id));
            await syncService.syncAttachments(attachmentStore.attachments);

            const [serverTasks, serverActions, serverAttachments] = await Promise.all([
                syncService.pullTasks(),
                syncService.pullActions(),
                syncService.pullAttachments(),
            ]);
            await taskStore.mergeTasksFromServer(serverTasks);
            await actionStore.mergeFromServer(serverActions);
            await attachmentStore.mergeFromServer(serverAttachments);
            await taskStore.markSynced(pendingIds);

            for (const id of pendingIds) {
                const task = taskStore.getTaskById(id);
                if (task) {
                    await actionStore.logAction({
                        taskId: id,
                        taskTitle: task.title,
                        type: 'synced',
                        description: `Task "${task.title}" synced with server`,
                    });
                }
            }

            const leftoverActions = actionStore.unsyncedActions;
            if (leftoverActions.length > 0) {
                const pushed = await syncService.syncActions(leftoverActions);
                await actionStore.markActionsSynced(pushed.map(a => a.id));
            }

            const restored = !hadLocalTasks && serverTasks.length > 0;
            const message = restored
                ? `Restored ${serverTasks.length} task(s) from server`
                : pendingIds.length > 0
                  ? `Synced ${pendingIds.length} task(s)`
                  : hadWork
                    ? 'Changes synced'
                    : 'Everything is up to date';

            runInAction(() => {
                this.lastSyncAt = Date.now();
                this.isSyncing = false;
            });

            if (!options.quiet || restored || hadWork) {
                toastStore.show(message, 'success');
            }
        } catch (error) {
            const pendingIds = taskStore.tasks
                .filter(t => t.syncStatus === 'pending')
                .map(t => t.id);
            await taskStore.markSyncFailed(pendingIds);

            const message = error instanceof Error ? error.message : 'Sync failed';

            runInAction(() => {
                this.lastError = message;
                this.isSyncing = false;
            });

            if (!options.silentErrors) {
                toastStore.show(message, 'error');
            }

            await actionStore.logAction({
                taskId: 'system',
                type: 'sync_failed',
                description: `Sync failed: ${message}`,
            });
        }
    };
}

export const syncStore = new SyncStore();

const syncContext = createContext(syncStore);

export const useSyncStore = () => useContext(syncContext);
