import { Task } from '../model/types';
import { firebaseClient } from '@/src/shared/api';
import { normalizeTaskLocation } from '../lib/location';

export class TaskService {
    getTasks = async (): Promise<Task[]> => {
        const { data } = await firebaseClient.get<Record<string, Task> | null>('/tasks.json');
        if (!data) return [];
        return Object.entries(data).map(([id, task]) => ({
            ...task,
            id,
            location: normalizeTaskLocation(task.location),
            updatedAt: task.updatedAt ?? task.creationDate,
            syncStatus: task.syncStatus ?? 'synced',
        }));
    };

    addTask = async (task: Task): Promise<void> => {
        await firebaseClient.put(`/tasks/${task.id}.json`, task);
    };

    updateTask = async (task: Task): Promise<void> => {
        await firebaseClient.put(`/tasks/${task.id}.json`, task);
    };

    removeTask = async (id: string): Promise<void> => {
        await firebaseClient.delete(`/tasks/${id}.json`);
    };
}
