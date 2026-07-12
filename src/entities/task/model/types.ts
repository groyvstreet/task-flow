export interface Task {
    id: string;
    creationDate: number;
    history: Array<any>;
    title: string;
    description: string;
    dueDate: number;
    location: string;
    attachments: Array<any>;
    status: 'new' | 'in-progress' | 'completed' | 'cancelled';
}
