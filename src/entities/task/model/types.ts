export type TaskStatus = 'new' | 'in-progress' | 'completed' | 'cancelled';
export type SyncStatus = 'pending' | 'synced' | 'failed';
export type TaskSortField = 'creationDate' | 'dueDate' | 'status';

export interface TaskLocation {
    address: string;
    latitude?: number;
    longitude?: number;
}

export interface Task {
    id: string;
    creationDate: number;
    updatedAt: number;
    title: string;
    description: string;
    dueDate: number;
    location: TaskLocation;
    status: TaskStatus;
    syncStatus: SyncStatus;
    notificationId?: string;
}

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
    new: 'New',
    'in-progress': 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

export const SYNC_STATUS_LABELS: Record<SyncStatus, string> = {
    pending: 'Pending Sync',
    synced: 'Synced',
    failed: 'Sync Failed',
};

export const STATUS_ORDER: Record<TaskStatus, number> = {
    new: 0,
    'in-progress': 1,
    completed: 2,
    cancelled: 3,
};
