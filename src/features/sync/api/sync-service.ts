import { Task, TaskService } from '@/src/entities/task';
import { Action, ActionService } from '@/src/entities/action';
import { Attachment, AttachmentService } from '@/src/entities/attachment';
import { firebaseClient, mockClient } from '@/src/shared/api';
import { API_CONFIG } from '@/src/shared/api';

const taskService = new TaskService();
const actionService = new ActionService();
const attachmentService = new AttachmentService();

export class SyncService {
    isOnline = async (): Promise<boolean> => {
        try {
            if (API_CONFIG.USE_MOCK_SERVER) {
                await mockClient.get('/tasks', { timeout: 3000 });
            } else {
                await firebaseClient.get('/.json', { timeout: 3000 });
            }
            return true;
        } catch {
            return false;
        }
    };

    syncDeletedTasks = async (deletedIds: string[]): Promise<void> => {
        for (const id of deletedIds) {
            try {
                if (API_CONFIG.USE_MOCK_SERVER) {
                    await mockClient.delete(`/tasks/${id}`);
                } else {
                    await taskService.removeTask(id);
                }
            } catch {
                throw new Error(`Failed to delete task ${id} on server`);
            }
        }
    };

    syncTasks = async (tasks: Task[]): Promise<void> => {
        const pending = tasks.filter(t => t.syncStatus === 'pending');
        for (const task of pending) {
            try {
                if (API_CONFIG.USE_MOCK_SERVER) {
                    await mockClient.put(`/tasks/${task.id}`, task);
                } else {
                    await taskService.updateTask({ ...task, syncStatus: 'synced' });
                }
            } catch {
                throw new Error(`Failed to sync task ${task.id}`);
            }
        }
    };

    syncActions = async (actions: Action[]): Promise<Action[]> => {
        const synced: Action[] = [];
        for (const action of actions) {
            try {
                if (API_CONFIG.USE_MOCK_SERVER) {
                    await mockClient.post('/actions', action);
                } else {
                    await actionService.addAction({ ...action, synced: true });
                }
                synced.push(action);
            } catch {
                throw new Error(`Failed to sync action ${action.id}`);
            }
        }
        return synced;
    };

    clearActions = async (): Promise<void> => {
        try {
            if (API_CONFIG.USE_MOCK_SERVER) {
                const { data } = await mockClient.get<Action[]>('/actions');
                const actions = Array.isArray(data) ? data : [];
                for (const action of actions) {
                    await mockClient.delete(`/actions/${action.id}`);
                }
            } else {
                await actionService.clearAll();
            }
        } catch {
            throw new Error('Failed to clear actions on server');
        }
    };

    syncAttachments = async (attachments: Attachment[]): Promise<void> => {
        for (const attachment of attachments) {
            try {
                if (API_CONFIG.USE_MOCK_SERVER) {
                    await mockClient.put(`/attachments/${attachment.id}`, attachment);
                } else {
                    await attachmentService.addAttachment(attachment);
                }
            } catch {
                throw new Error(`Failed to sync attachment ${attachment.id}`);
            }
        }
    };

    syncDeletedAttachments = async (deletedIds: string[]): Promise<void> => {
        for (const id of deletedIds) {
            try {
                if (API_CONFIG.USE_MOCK_SERVER) {
                    await mockClient.delete(`/attachments/${id}`);
                } else {
                    await attachmentService.removeAttachment(id);
                }
            } catch {
                throw new Error(`Failed to delete attachment ${id} on server`);
            }
        }
    };

    pullTasks = async (): Promise<Task[]> => {
        if (API_CONFIG.USE_MOCK_SERVER) {
            const { data } = await mockClient.get<Task[]>('/tasks');
            return Array.isArray(data) ? data : [];
        }
        return taskService.getTasks();
    };

    pullActions = async (): Promise<Action[]> => {
        if (API_CONFIG.USE_MOCK_SERVER) {
            const { data } = await mockClient.get<Action[]>('/actions');
            return Array.isArray(data) ? data : [];
        }
        return actionService.getActions();
    };

    pullAttachments = async (): Promise<Attachment[]> => {
        if (API_CONFIG.USE_MOCK_SERVER) {
            const { data } = await mockClient.get<Attachment[]>('/attachments');
            return Array.isArray(data) ? data : [];
        }
        return attachmentService.getAttachments();
    };
}

export const syncService = new SyncService();
