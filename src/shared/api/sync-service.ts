import { Task } from '@/src/entities/task/model/types';
import { Action } from '@/src/entities/action/model/types';
import { Attachment } from '@/src/entities/attachment/model/types';
import { mockClient } from '@/src/shared/api/client';
import { API_CONFIG } from '@/src/shared/api/config';

export class SyncService {
    isOnline = async (): Promise<boolean> => {
        if (!API_CONFIG.USE_MOCK_SERVER) return false;
        try {
            await mockClient.get('/tasks', { timeout: 3000 });
            return true;
        } catch {
            return false;
        }
    };

    syncDeletedTasks = async (deletedIds: string[]): Promise<void> => {
        for (const id of deletedIds) {
            try {
                await mockClient.delete(`/tasks/${id}`);
            } catch {
                throw new Error(`Failed to delete task ${id} on server`);
            }
        }
    };

    syncTasks = async (tasks: Task[]): Promise<void> => {
        const pending = tasks.filter(t => t.syncStatus === 'pending');
        for (const task of pending) {
            try {
                await mockClient.put(`/tasks/${task.id}`, task);
            } catch {
                throw new Error(`Failed to sync task ${task.id}`);
            }
        }
    };

    syncActions = async (actions: Action[]): Promise<Action[]> => {
        const synced: Action[] = [];
        for (const action of actions) {
            try {
                await mockClient.post('/actions', action);
                synced.push(action);
            } catch {
                throw new Error(`Failed to sync action ${action.id}`);
            }
        }
        return synced;
    };

    syncAttachments = async (attachments: Attachment[]): Promise<void> => {
        for (const attachment of attachments) {
            try {
                await mockClient.put(`/attachments/${attachment.id}`, attachment);
            } catch {
                throw new Error(`Failed to sync attachment ${attachment.id}`);
            }
        }
    };

    pullTasks = async (): Promise<Task[]> => {
        const { data } = await mockClient.get<Task[]>('/tasks');
        return Array.isArray(data) ? data : [];
    };
}

export const syncService = new SyncService();
