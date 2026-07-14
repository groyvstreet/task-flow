import { Task } from '@/src/entities/task/model/types';
import { Action } from '@/src/entities/action/model/types';
import { Attachment } from '@/src/entities/attachment/model/types';
import { firebaseClient, mockClient } from '@/src/shared/api/client';
import { API_CONFIG } from '@/src/shared/api/config';
import { TaskService } from '@/src/entities/task/api/service';
import { ActionService } from '@/src/entities/action/api/service';
import { AttachmentService } from '@/src/entities/attachment/api/service';

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
