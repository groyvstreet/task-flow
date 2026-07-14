import { createContext, useContext } from 'react';
import { Task, TaskSortField, STATUS_ORDER } from './types';
import { makeAutoObservable, runInAction } from 'mobx';
import { TaskService } from '../api/service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/src/shared/lib/constants';
import { actionStore } from '@/src/entities/action/model/store';
import { attachmentStore } from '@/src/entities/attachment/model/store';
import {
    canScheduleDueReminder,
    cancelTaskNotification,
    NOTIFICATION_TOO_SOON_MESSAGE,
    scheduleTaskNotification,
} from '@/src/shared/lib/notifications';
import { requestAutoSync } from '@/src/shared/api/auto-sync';

export type AddTaskResult = {
    warning?: string;
};

export class TaskStore {
    private taskService: TaskService;

    tasks: Task[] = [];
    deletedTaskIds: string[] = [];
    isLoading = false;
    sortField: TaskSortField = 'creationDate';
    sortAscending = false;

    constructor(taskService: TaskService) {
        this.taskService = taskService;
        makeAutoObservable(this);
    }

    init = async () => {
        this.isLoading = true;
        try {
            const [tasksData, deletedData] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.TASKS),
                AsyncStorage.getItem(STORAGE_KEYS.DELETED_TASK_IDS),
            ]);

            runInAction(() => {
                if (tasksData) {
                    const parsed: Task[] = JSON.parse(tasksData);
                    this.tasks = parsed.map(t => ({
                        ...t,
                        location:
                            typeof t.location === 'string'
                                ? { address: t.location as unknown as string }
                                : t.location,
                        syncStatus: t.syncStatus ?? 'pending',
                        updatedAt: t.updatedAt ?? t.creationDate,
                    }));
                }
                if (deletedData) {
                    this.deletedTaskIds = JSON.parse(deletedData);
                }
            });
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    };

    private saveTasks = async () => {
        await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(this.tasks));
    };

    private saveDeletedIds = async () => {
        await AsyncStorage.setItem(
            STORAGE_KEYS.DELETED_TASK_IDS,
            JSON.stringify(this.deletedTaskIds),
        );
    };

    setSortField = (field: TaskSortField) => {
        if (this.sortField === field) {
            this.sortAscending = !this.sortAscending;
        } else {
            this.sortField = field;
            this.sortAscending = false;
        }
    };

    get sortedTasks(): Task[] {
        const sorted = [...this.tasks];
        sorted.sort((a, b) => {
            let cmp = 0;
            if (this.sortField === 'status') {
                cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
            } else {
                cmp = a[this.sortField] - b[this.sortField];
            }
            return this.sortAscending ? cmp : -cmp;
        });
        return sorted;
    }

    getTaskById = (id: string): Task | undefined => {
        return this.tasks.find(t => t.id === id);
    };

    get tasksWithLocation(): Task[] {
        return this.tasks.filter(
            t => t.location.latitude != null && t.location.longitude != null,
        );
    }

    addTask = async (task: Omit<Task, 'syncStatus' | 'updatedAt'>): Promise<AddTaskResult> => {
        const newTask: Task = {
            ...task,
            syncStatus: 'pending',
            updatedAt: Date.now(),
        };

        runInAction(() => {
            this.tasks = [newTask, ...this.tasks];
        });
        await this.saveTasks();

        await actionStore.logAction({
            taskId: newTask.id,
            taskTitle: newTask.title,
            type: 'created',
            description: `Task "${newTask.title}" created`,
        });

        const warning = canScheduleDueReminder(newTask.dueDate)
            ? undefined
            : NOTIFICATION_TOO_SOON_MESSAGE;
        if (canScheduleDueReminder(newTask.dueDate)) {
            void this.attachNotification(newTask.id, newTask.title, newTask.dueDate);
        }
        requestAutoSync();

        return { warning };
    };

    private attachNotification = async (
        taskId: string,
        title: string,
        dueDate: number,
    ): Promise<string | undefined> => {
        try {
            const result = await scheduleTaskNotification(taskId, title, dueDate);
            runInAction(() => {
                this.tasks = this.tasks.map(t =>
                    t.id === taskId
                        ? { ...t, notificationId: result.notificationId ?? undefined }
                        : t,
                );
            });
            await this.saveTasks();
            return result.warning;
        } catch (error) {
            console.warn('Failed to schedule notification', error);
            return 'Task saved, but notification could not be scheduled on this device';
        }
    };

    updateTask = async (
        task: Task,
        logDescription?: string,
    ): Promise<{ warning?: string } | void> => {
        const existing = this.tasks.find(t => t.id === task.id);
        if (!existing) return;

        const updated: Task = {
            ...task,
            syncStatus: 'pending',
            updatedAt: Date.now(),
        };

        const shouldRescheduleNotification =
            existing.dueDate !== task.dueDate || existing.title !== task.title;

        const statusChanged = existing.status !== task.status;
        const contentChanged =
            existing.title !== task.title ||
            existing.description !== task.description ||
            existing.dueDate !== task.dueDate ||
            existing.location.address !== task.location.address ||
            existing.location.latitude !== task.location.latitude ||
            existing.location.longitude !== task.location.longitude;

        runInAction(() => {
            this.tasks = this.tasks.map(t => (t.id === task.id ? updated : t));
        });
        await this.saveTasks();

        if (statusChanged && !contentChanged) {
            await actionStore.logAction({
                taskId: task.id,
                taskTitle: task.title,
                type: 'status_changed',
                description: `Status updated from "${existing.status}" to "${task.status}"`,
            });
        } else if (contentChanged) {
            await actionStore.logAction({
                taskId: task.id,
                taskTitle: task.title,
                type: 'updated',
                description: logDescription ?? `Task "${task.title}" updated`,
            });
        }

        requestAutoSync();

        let warning: string | undefined;
        if (shouldRescheduleNotification) {
            if (!canScheduleDueReminder(updated.dueDate)) {
                warning = NOTIFICATION_TOO_SOON_MESSAGE;
                if (existing.notificationId) {
                    void cancelTaskNotification(existing.notificationId);
                }
                runInAction(() => {
                    this.tasks = this.tasks.map(t =>
                        t.id === updated.id ? { ...t, notificationId: undefined } : t,
                    );
                });
                void this.saveTasks();
            } else {
                void (async () => {
                    try {
                        if (existing.notificationId) {
                            await cancelTaskNotification(existing.notificationId);
                        }
                        await this.attachNotification(
                            updated.id,
                            updated.title,
                            updated.dueDate,
                        );
                    } catch (error) {
                        console.warn('Failed to reschedule notification', error);
                    }
                })();
            }
        }

        return { warning };
    };

    updateStatus = async (taskId: string, status: Task['status']) => {
        const task = this.getTaskById(taskId);
        if (!task || task.status === status) return;
        await this.updateTask({ ...task, status });
    };

    removeTask = async (task: Task) => {
        try {
            if (task.notificationId) {
                await cancelTaskNotification(task.notificationId);
            }
        } catch (error) {
            console.warn('Failed to cancel notification', error);
        }

        runInAction(() => {
            this.tasks = this.tasks.filter(t => t.id !== task.id);
            this.deletedTaskIds = [...this.deletedTaskIds, task.id];
        });
        await this.saveTasks();
        await this.saveDeletedIds();

        await actionStore.logAction({
            taskId: task.id,
            taskTitle: task.title,
            type: 'deleted',
            description: `Task "${task.title}" deleted`,
        });

        const taskAttachments = attachmentStore.getByTaskId(task.id);
        for (const att of taskAttachments) {
            await attachmentStore.removeAttachment(att, false);
        }

        requestAutoSync();
    };

    importTask = async (task: Task) => {
        runInAction(() => {
            this.tasks = [task, ...this.tasks];
        });
        await this.saveTasks();
    };

    replaceTask = async (task: Task) => {
        runInAction(() => {
            this.tasks = this.tasks.map(t => (t.id === task.id ? task : t));
        });
        await this.saveTasks();
    };

    mergeTasksFromServer = async (serverTasks: Task[]) => {
        for (const serverTask of serverTasks) {
            const local = this.getTaskById(serverTask.id);
            if (!local) {
                await this.importTask({
                    ...serverTask,
                    syncStatus: serverTask.syncStatus ?? 'synced',
                });
                continue;
            }
            if (local.syncStatus === 'pending') continue;
            if (serverTask.updatedAt >= local.updatedAt) {
                await this.replaceTask({
                    ...serverTask,
                    syncStatus: 'synced',
                });
            }
        }
    };

    markSynced = async (taskIds: string[]) => {
        runInAction(() => {
            this.tasks = this.tasks.map(t =>
                taskIds.includes(t.id) ? { ...t, syncStatus: 'synced' as const } : t,
            );
        });
        await this.saveTasks();
    };

    markSyncFailed = async (taskIds: string[]) => {
        runInAction(() => {
            this.tasks = this.tasks.map(t =>
                taskIds.includes(t.id) ? { ...t, syncStatus: 'failed' as const } : t,
            );
        });
        await this.saveTasks();
    };

    markDeletedSynced = async (taskIds: string[]) => {
        runInAction(() => {
            this.deletedTaskIds = this.deletedTaskIds.filter(id => !taskIds.includes(id));
        });
        await this.saveDeletedIds();
    };

    get pendingSyncCount(): number {
        return this.tasks.filter(t => t.syncStatus === 'pending').length;
    }
}

export const taskStore = new TaskStore(new TaskService());

const taskContext = createContext(taskStore);

export const useTaskStore = () => useContext(taskContext);
