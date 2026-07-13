import { createContext, useContext } from 'react';
import { Attachment } from './types';
import { makeAutoObservable, runInAction } from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/src/shared/lib/constants';
import { actionStore } from '@/src/entities/action/model/store';
import { AttachmentService } from '../api/service';

export class AttachmentStore {
    private attachmentService: AttachmentService;

    attachments: Attachment[] = [];
    isLoading = false;

    constructor(attachmentService: AttachmentService) {
        this.attachmentService = attachmentService;
        makeAutoObservable(this);
    }

    init = async () => {
        this.isLoading = true;
        const data = await AsyncStorage.getItem(STORAGE_KEYS.ATTACHMENTS);

        runInAction(() => {
            if (data) {
                this.attachments = JSON.parse(data);
            }
            this.isLoading = false;
        });
    };

    private saveAttachments = async () => {
        await AsyncStorage.setItem(STORAGE_KEYS.ATTACHMENTS, JSON.stringify(this.attachments));
    };

    getByTaskId = (taskId: string): Attachment[] => {
        return this.attachments.filter(a => a.taskId === taskId);
    };

    addAttachment = async (attachment: Attachment) => {
        runInAction(() => {
            this.attachments = [attachment, ...this.attachments];
        });
        await this.saveAttachments();

        await actionStore.logAction({
            taskId: attachment.taskId,
            type: 'attachment_added',
            description: `Attachment "${attachment.name}" added`,
        });
    };

    removeAttachment = async (attachment: Attachment, log = true) => {
        runInAction(() => {
            this.attachments = this.attachments.filter(a => a.id !== attachment.id);
        });
        await this.saveAttachments();

        if (log) {
            await actionStore.logAction({
                taskId: attachment.taskId,
                type: 'attachment_removed',
                description: `Attachment "${attachment.name}" removed`,
            });
        }
    };
}

export const attachmentStore = new AttachmentStore(new AttachmentService());

const attachmentContext = createContext(attachmentStore);

export const useAttachmentStore = () => useContext(attachmentContext);
