export type AttachmentType = 'image' | 'pdf' | 'other';

export interface Attachment {
    id: string;
    taskId: string;
    uri: string;
    name: string;
    mimeType: string;
    type: AttachmentType;
    createdAt: number;
}
