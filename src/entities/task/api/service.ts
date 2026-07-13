import { Task } from '../model/types';
import { firebaseClient } from '@/src/shared/api/client';

/**
 * Firebase Realtime Database REST API layer.
 * Configure FIREBASE_BASE_URL in src/shared/api/config.ts, then uncomment calls.
 * Docs: https://firebase.google.com/docs/reference/rest/database
 */
export class TaskService {
    getTasks = async (): Promise<Task[]> => {
        // const { data } = await firebaseClient.get<Record<string, Task>>('/tasks.json');
        // if (!data) return [];
        // return Object.entries(data).map(([id, task]) => ({ ...task, id }));
        return [];
    };

    addTask = async (task: Task): Promise<void> => {
        // await firebaseClient.put(`/tasks/${task.id}.json`, task);
    };

    updateTask = async (task: Task): Promise<void> => {
        // await firebaseClient.patch(`/tasks/${task.id}.json`, task);
    };

    removeTask = async (id: string): Promise<void> => {
        // await firebaseClient.delete(`/tasks/${id}.json`);
    };
}
