import { Attachment } from '../model/types';
import { firebaseClient } from '@/src/shared/api/client';

/**
 * Firebase Realtime Database REST API layer for attachments metadata.
 * Uncomment axios calls after configuring FIREBASE_BASE_URL.
 */
export class AttachmentService {
    getAttachments = async (): Promise<Attachment[]> => {
        // const { data } = await firebaseClient.get<Record<string, Attachment>>('/attachments.json');
        // if (!data) return [];
        // return Object.entries(data).map(([id, attachment]) => ({ ...attachment, id }));
        return [];
    };

    addAttachment = async (attachment: Attachment): Promise<void> => {
        // await firebaseClient.put(`/attachments/${attachment.id}.json`, attachment);
    };

    removeAttachment = async (id: string): Promise<void> => {
        // await firebaseClient.delete(`/attachments/${id}.json`);
    };
}
