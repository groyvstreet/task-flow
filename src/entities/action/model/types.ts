export type ActionType =
    | 'created'
    | 'updated'
    | 'status_changed'
    | 'attachment_added'
    | 'attachment_removed'
    | 'deleted'
    | 'synced'
    | 'sync_failed';

export interface Action {
    id: string;
    taskId: string;
    taskTitle?: string;
    type: ActionType;
    description: string;
    timestamp: number;
    synced?: boolean;
}

export const ACTION_TYPE_LABELS: Record<ActionType, string> = {
    created: 'Created',
    updated: 'Updated',
    status_changed: 'Status Updated',
    attachment_added: 'Attachment Added',
    attachment_removed: 'Attachment Removed',
    deleted: 'Deleted',
    synced: 'Synced',
    sync_failed: 'Sync Failed',
};
