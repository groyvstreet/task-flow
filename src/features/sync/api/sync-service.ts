import { Task, TaskService } from '@/src/entities/task';
import { Action, ActionService } from '@/src/entities/action';
import { Attachment, AttachmentService } from '@/src/entities/attachment';
import { firebaseClient } from '@/src/shared/api';

const taskService = new TaskService();
const actionService = new ActionService();
const attachmentService = new AttachmentService();

export class SyncService {
    isOnline = async (): Promise<boolean> => {
        try {
            await firebaseClient.get('/.json', { timeout: 3000 });
            return true;
        } catch {
            return false;
        }
    };

    syncDeletedTasks = async (deletedIds: string[]): Promise<void> => {
        for (const id of deletedIds) {
            try {
                await taskService.removeTask(id);
            } catch {
                throw new Error(`Failed to delete task ${id} on server`);
            }
        }
    };

    syncTasks = async (tasks: Task[]): Promise<void> => {
        const pending = tasks.filter(t => t.syncStatus === 'pending');
        for (const task of pending) {
            try {
                await taskService.updateTask({ ...task, syncStatus: 'synced' });
            } catch {
                throw new Error(`Failed to sync task ${task.id}`);
            }
        }
    };

    syncActions = async (actions: Action[]): Promise<Action[]> => {
        const synced: Action[] = [];
        for (const action of actions) {
            try {
                await actionService.addAction({ ...action, synced: true });
                synced.push(action);
            } catch {
                throw new Error(`Failed to sync action ${action.id}`);
            }
        }
        return synced;
    };

    clearActions = async (): Promise<void> => {
        try {
            await actionService.clearAll();
        } catch {
            throw new Error('Failed to clear actions on server');
        }
    };

    syncAttachments = async (attachments: Attachment[]): Promise<void> => {
        for (const attachment of attachments) {
            try {
                await attachmentService.addAttachment(attachment);
            } catch {
                throw new Error(`Failed to sync attachment ${attachment.id}`);
            }
        }
    };

    syncDeletedAttachments = async (deletedIds: string[]): Promise<void> => {
        for (const id of deletedIds) {
            try {
                await attachmentService.removeAttachment(id);
            } catch {
                throw new Error(`Failed to delete attachment ${id} on server`);
            }
        }
    };

    pullTasks = async (): Promise<Task[]> => {
        return taskService.getTasks();
    };

    pullActions = async (): Promise<Action[]> => {
        return actionService.getActions();
    };

    pullAttachments = async (): Promise<Attachment[]> => {
        return attachmentService.getAttachments();
    };
}

export const syncService = new SyncService();
