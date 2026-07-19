import { makeAutoObservable, runInAction } from 'mobx';
import { createContext, useContext } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { syncService } from '../api/sync-service';
import { registerAutoSyncTrigger } from '@/src/shared/api';
import { taskStore } from '@/src/entities/task';
import { actionStore } from '@/src/entities/action';
import { attachmentStore } from '@/src/entities/attachment';
import { toastStore } from '@/src/shared/ui';

type SyncOptions = {
    quiet?: boolean;
    silentErrors?: boolean;
};

const AUTO_SYNC_DEBOUNCE_MS = 400;
const REACHABILITY_RETRIES = 4;
const REACHABILITY_DELAY_MS = 1200;

const isConnected = (state: NetInfoState): boolean => {
    if (state.isConnected === false) return false;
    if (state.isInternetReachable === false) return false;
    return state.isConnected === true;
};

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export class SyncStore {
    isSyncing = false;
    isOnline = false;
    lastSyncAt: number | null = null;
    lastError: string | null = null;

    private initialNetworkResolved = false;
    /** Non-observable internals (excluded in makeAutoObservable) */
    autoSyncTimer: ReturnType<typeof setTimeout> | null = null;
    pendingSync = false;
    pendingSyncQuiet = true;
    networkReady: Promise<boolean> = Promise.resolve(false);

    constructor() {
        makeAutoObservable(this, {
            autoSyncTimer: false,
            pendingSync: false,
            pendingSyncQuiet: false,
            networkReady: false,
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
                void this.syncAllWithReachabilityRetry();
            }
        });

        return initial;
    };

    private syncAllWithReachabilityRetry = async () => {
        for (let attempt = 0; attempt < REACHABILITY_RETRIES; attempt++) {
            if (attempt > 0) {
                await sleep(REACHABILITY_DELAY_MS * attempt);
            }
            if (!this.isOnline) return;

            const reachable = await syncService.isOnline();
            if (reachable) {
                await this.syncAll({ quiet: true });
                return;
            }
        }

        toastStore.show('Server is not reachable yet. Try Sync when ready.', 'warning');
    };

    hydrateOnLaunch = async () => {
        const online = await this.networkReady.catch(() => false);
        if (!online) return;
        await this.syncAllWithReachabilityRetry();
    };

    requestSync = () => {
        if (!this.isOnline) return;
        if (this.isSyncing) {
            this.pendingSync = true;
            this.pendingSyncQuiet = true;
            return;
        }
        if (this.autoSyncTimer) clearTimeout(this.autoSyncTimer);
        this.autoSyncTimer = setTimeout(() => {
            this.autoSyncTimer = null;
            if (!this.isOnline) return;
            if (this.isSyncing) {
                this.pendingSync = true;
                this.pendingSyncQuiet = true;
                return;
            }
            void this.syncAll({ quiet: true });
        }, AUTO_SYNC_DEBOUNCE_MS);
    };

    syncAll = async (options: SyncOptions = {}) => {
        if (this.isSyncing) {
            this.pendingSync = true;
            this.pendingSyncQuiet = options.quiet ?? false;
            return;
        }

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
                    this.isSyncing = false;
                });
                if (!options.silentErrors) {
                    toastStore.show(message, 'warning');
                }
                this.flushPendingSync();
                return;
            }

            runInAction(() => {
                this.isOnline = true;
            });

            const pendingIds = taskStore.tasks
                .filter(t => t.syncStatus === 'pending')
                .map(t => t.id);
            const deletedIds = [...new Set(taskStore.deletedTaskIds)];
            const deletedAttachmentIds = [...new Set(attachmentStore.deletedAttachmentIds)];
            const historyClearPending = actionStore.historyClearPending;
            const unsyncedActions = historyClearPending ? [] : actionStore.unsyncedActions;
            const hadLocalTasks = taskStore.tasks.length > 0;
            const hadWork =
                pendingIds.length > 0 ||
                deletedIds.length > 0 ||
                deletedAttachmentIds.length > 0 ||
                historyClearPending ||
                unsyncedActions.length > 0;

            if (deletedIds.length > 0) {
                await syncService.syncDeletedTasks(deletedIds);
            }
            if (deletedAttachmentIds.length > 0) {
                await syncService.syncDeletedAttachments(deletedAttachmentIds);
            }
            if (historyClearPending) {
                await syncService.clearActions();
                await actionStore.markHistoryClearSynced();
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

            // Orphans left on server when a task was deleted before attachment sync existed
            const orphanAttachmentIds = serverAttachments
                .filter(
                    a =>
                        deletedIds.includes(a.taskId) ||
                        deletedAttachmentIds.includes(a.id),
                )
                .map(a => a.id);
            if (orphanAttachmentIds.length > 0) {
                await syncService.syncDeletedAttachments(orphanAttachmentIds);
            }

            const attachmentsForMerge = serverAttachments.filter(
                a => !orphanAttachmentIds.includes(a.id) && !deletedIds.includes(a.taskId),
            );

            await taskStore.mergeTasksFromServer(serverTasks);
            await actionStore.mergeFromServer(serverActions);
            await attachmentStore.mergeFromServer(attachmentsForMerge, taskStore.deletedTaskIds);

            const serverIdSet = new Set(serverTasks.map(t => t.id));
            const confirmedDeleted = deletedIds.filter(id => !serverIdSet.has(id));
            if (confirmedDeleted.length > 0) {
                await taskStore.markDeletedSynced(confirmedDeleted);
            }

            const confirmedDeletedAttachments = [
                ...new Set([...deletedAttachmentIds, ...orphanAttachmentIds]),
            ];
            if (confirmedDeletedAttachments.length > 0) {
                await attachmentStore.markDeletedSynced(confirmedDeletedAttachments);
            }

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

            const leftoverDeletes = [...new Set(taskStore.deletedTaskIds)];
            if (leftoverDeletes.length > 0) {
                await syncService.syncDeletedTasks(leftoverDeletes);
                await taskStore.markDeletedSynced(leftoverDeletes);
            }

            const leftoverAttachmentDeletes = [...new Set(attachmentStore.deletedAttachmentIds)];
            if (leftoverAttachmentDeletes.length > 0) {
                await syncService.syncDeletedAttachments(leftoverAttachmentDeletes);
                await attachmentStore.markDeletedSynced(leftoverAttachmentDeletes);
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
                synced: true,
            });
        }

        this.flushPendingSync();
    };

    private flushPendingSync = () => {
        if (!this.pendingSync) return;
        const quiet = this.pendingSyncQuiet;
        this.pendingSync = false;
        this.pendingSyncQuiet = true;
        if (!this.isOnline || this.isSyncing) return;
        void this.syncAll({ quiet });
    };
}

export const syncStore = new SyncStore();

const syncContext = createContext(syncStore);

export const useSyncStore = () => useContext(syncContext);
