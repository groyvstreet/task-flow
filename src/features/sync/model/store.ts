import { makeAutoObservable, runInAction } from 'mobx';
import { createContext, useContext } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncService } from '@/src/shared/api/sync-service';
import { taskStore } from '@/src/entities/task/model/store';
import { actionStore } from '@/src/entities/action/model/store';
import { attachmentStore } from '@/src/entities/attachment/model/store';
import { API_CONFIG } from '@/src/shared/api/config';
import { toastStore } from '@/src/shared/ui/toastStore';

export class SyncStore {
    isSyncing = false;
    isOnline = true;
    lastSyncAt: number | null = null;
    lastError: string | null = null;

    constructor() {
        makeAutoObservable(this);
        this.setupNetworkListener();
    }

    private setupNetworkListener = () => {
        NetInfo.addEventListener(state => {
            const online = state.isConnected ?? false;
            const wasOffline = !this.isOnline;
            runInAction(() => {
                this.isOnline = online;
            });
            if (online && wasOffline && API_CONFIG.USE_MOCK_SERVER) {
                this.syncAll();
            }
        });
    };

    syncAll = async () => {
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
                    this.isSyncing = false;
                });
                toastStore.show(message, 'warning');
                return;
            }

            const pendingIds = taskStore.tasks
                .filter(t => t.syncStatus === 'pending')
                .map(t => t.id);
            const deletedIds = [...taskStore.deletedTaskIds];
            const unsyncedActions = actionStore.unsyncedActions;

            if (deletedIds.length > 0) {
                await syncService.syncDeletedTasks(deletedIds);
                await taskStore.markDeletedSynced(deletedIds);
            }

            await syncService.syncTasks(taskStore.tasks);
            const syncedActions = await syncService.syncActions(unsyncedActions);
            await actionStore.markActionsSynced(syncedActions.map(a => a.id));
            await syncService.syncAttachments(attachmentStore.attachments);

            const serverTasks = await syncService.pullTasks();
            await taskStore.mergeTasksFromServer(serverTasks);
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

            runInAction(() => {
                this.lastSyncAt = Date.now();
                this.isSyncing = false;
            });

            toastStore.show(
                pendingIds.length > 0
                    ? `Synced ${pendingIds.length} task(s)`
                    : 'Everything is up to date',
                'success',
            );
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

            toastStore.show(message, 'error');

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
