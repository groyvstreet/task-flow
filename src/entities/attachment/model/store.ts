import { createContext, useContext } from 'react';
import { Attachment } from './types';
import { makeAutoObservable, runInAction } from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/src/shared/lib';
import { actionStore } from '@/src/entities/action/@x/attachment';
import { AttachmentService } from '../api/service';
import { requestAutoSync } from '@/src/shared/api';

export class AttachmentStore {
    private attachmentService: AttachmentService;

    attachments: Attachment[] = [];
    deletedAttachmentIds: string[] = [];
    isLoading = false;

    constructor(attachmentService: AttachmentService) {
        this.attachmentService = attachmentService;
        makeAutoObservable(this);
    }

    init = async () => {
        this.isLoading = true;
        const [data, deletedData] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.ATTACHMENTS),
            AsyncStorage.getItem(STORAGE_KEYS.DELETED_ATTACHMENT_IDS),
        ]);

        runInAction(() => {
            if (data) {
                this.attachments = JSON.parse(data);
            }
            if (deletedData) {
                this.deletedAttachmentIds = JSON.parse(deletedData);
            }
            this.isLoading = false;
        });
    };

    private saveAttachments = async () => {
        await AsyncStorage.setItem(STORAGE_KEYS.ATTACHMENTS, JSON.stringify(this.attachments));
    };

    private saveDeletedIds = async () => {
        await AsyncStorage.setItem(
            STORAGE_KEYS.DELETED_ATTACHMENT_IDS,
            JSON.stringify(this.deletedAttachmentIds),
        );
    };

    getByTaskId = (taskId: string): Attachment[] => {
        return this.attachments.filter(a => a.taskId === taskId);
    };

    mergeFromServer = async (serverAttachments: Attachment[], deletedTaskIds: string[] = []) => {
        const deletedAttachments = new Set(this.deletedAttachmentIds);
        const deletedTasks = new Set(deletedTaskIds);

        const byId = new Map(
            this.attachments
                .filter(a => !deletedAttachments.has(a.id) && !deletedTasks.has(a.taskId))
                .map(a => [a.id, a]),
        );

        for (const remote of serverAttachments) {
            if (deletedAttachments.has(remote.id)) continue;
            if (deletedTasks.has(remote.taskId)) continue;
            if (!byId.has(remote.id)) {
                byId.set(remote.id, remote);
            }
        }

        runInAction(() => {
            this.attachments = Array.from(byId.values());
        });
        await this.saveAttachments();
    };

    addAttachment = async (attachment: Attachment) => {
        runInAction(() => {
            this.attachments = [attachment, ...this.attachments];
            this.deletedAttachmentIds = this.deletedAttachmentIds.filter(id => id !== attachment.id);
        });
        await this.saveAttachments();
        await this.saveDeletedIds();

        await actionStore.logAction({
            taskId: attachment.taskId,
            type: 'attachment_added',
            description: `Attachment "${attachment.name}" added`,
        });
        requestAutoSync();
    };

    removeAttachment = async (attachment: Attachment, log = true) => {
        runInAction(() => {
            this.attachments = this.attachments.filter(a => a.id !== attachment.id);
            if (!this.deletedAttachmentIds.includes(attachment.id)) {
                this.deletedAttachmentIds = [...this.deletedAttachmentIds, attachment.id];
            }
        });
        await this.saveAttachments();
        await this.saveDeletedIds();

        if (log) {
            await actionStore.logAction({
                taskId: attachment.taskId,
                type: 'attachment_removed',
                description: `Attachment "${attachment.name}" removed`,
            });
        }
        requestAutoSync();
    };

    removeByTaskId = async (taskId: string) => {
        const toRemove = this.attachments.filter(a => a.taskId === taskId);
        if (toRemove.length === 0) return;

        const ids = toRemove.map(a => a.id);
        runInAction(() => {
            this.attachments = this.attachments.filter(a => a.taskId !== taskId);
            this.deletedAttachmentIds = [...new Set([...this.deletedAttachmentIds, ...ids])];
        });
        await this.saveAttachments();
        await this.saveDeletedIds();
    };

    clearAll = async () => {
        const ids = this.attachments.map(a => a.id);
        runInAction(() => {
            this.deletedAttachmentIds = [...new Set([...this.deletedAttachmentIds, ...ids])];
            this.attachments = [];
        });
        await this.saveAttachments();
        await this.saveDeletedIds();
    };

    markDeletedSynced = async (attachmentIds: string[]) => {
        runInAction(() => {
            this.deletedAttachmentIds = this.deletedAttachmentIds.filter(
                id => !attachmentIds.includes(id),
            );
        });
        await this.saveDeletedIds();
    };
}

export const attachmentStore = new AttachmentStore(new AttachmentService());

const attachmentContext = createContext(attachmentStore);

export const useAttachmentStore = () => useContext(attachmentContext);
