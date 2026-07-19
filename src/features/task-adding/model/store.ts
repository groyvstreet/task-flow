import {
    taskStore,
    TaskStore,
    type Task,
    validateTaskForm,
    hasValidationErrors,
    LocationFormHelper,
    type ValidationErrors,
} from '@/src/entities/task';
import { attachmentStore, type Attachment } from '@/src/entities/attachment';
import { makeAutoObservable, runInAction } from 'mobx';
import { createContext, useContext } from 'react';
import { randomUUID } from 'expo-crypto';

const createId = () => {
    try {
        return randomUUID();
    } catch {
        return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }
};

export class TaskAddingStore {
    private taskStore: TaskStore;
    readonly locationForm = new LocationFormHelper();

    isModalVisible = false;
    isSubmitting = false;
    title = '';
    description = '';
    dueDate = new Date(Date.now() + 3600000);
    status: Task['status'] = 'new';
    pendingAttachments: Attachment[] = [];
    errors: ValidationErrors = {};
    submitError: string | null = null;

    constructor(taskStore: TaskStore) {
        this.taskStore = taskStore;
        makeAutoObservable(this, {
            locationForm: false,
        });
    }

    get location() {
        return this.locationForm.location;
    }

    get isGeocoding() {
        return this.locationForm.isGeocoding;
    }

    get geocodeHint() {
        return this.locationForm.geocodeHint;
    }

    private reset = () => {
        this.title = '';
        this.description = '';
        this.dueDate = new Date(Date.now() + 3600000);
        this.locationForm.resetLocation({ address: '' });
        this.status = 'new';
        this.pendingAttachments = [];
        this.errors = {};
        this.submitError = null;
        this.isSubmitting = false;
    };

    openModal = () => {
        this.reset();
        this.isModalVisible = true;
    };

    closeModal = () => {
        this.isModalVisible = false;
    };

    toggleModalVisibility = () => {
        if (this.isModalVisible) {
            this.closeModal();
        } else {
            this.openModal();
        }
    };

    setTitle = (title: string) => {
        this.title = title;
        if (this.errors.title) this.errors = { ...this.errors, title: undefined };
    };

    setDescription = (description: string) => {
        this.description = description;
        if (this.errors.description) this.errors = { ...this.errors, description: undefined };
    };

    setDueDate = (dueDate: Date) => {
        this.dueDate = dueDate;
        if (this.errors.dueDate) this.errors = { ...this.errors, dueDate: undefined };
    };

    setLocationAddress = (address: string) => {
        this.locationForm.setLocationAddress(address);
        if (this.errors.location) this.errors = { ...this.errors, location: undefined };
    };

    setLocationCoordinateFields = (latitudeText: string, longitudeText: string) => {
        this.locationForm.setLocationCoordinateFields(latitudeText, longitudeText);
    };

    setStatus = (status: string) => {
        this.status = status as Task['status'];
    };

    addPendingAttachment = (attachment: Omit<Attachment, 'id' | 'taskId' | 'createdAt'>) => {
        this.pendingAttachments = [
            ...this.pendingAttachments,
            {
                ...attachment,
                id: createId(),
                taskId: '',
                createdAt: Date.now(),
            },
        ];
    };

    removePendingAttachment = (id: string) => {
        this.pendingAttachments = this.pendingAttachments.filter(a => a.id !== id);
    };

    addTask = async (): Promise<{ ok: boolean; warning?: string }> => {
        if (this.isSubmitting) return { ok: false };

        const errors = validateTaskForm({
            title: this.title,
            description: this.description,
            dueDate: this.dueDate,
            location: this.location,
        });
        this.errors = errors;
        this.submitError = null;

        if (hasValidationErrors(errors)) {
            return { ok: false };
        }

        this.isSubmitting = true;
        try {
            const taskId = createId();
            const { warning } = await this.taskStore.addTask({
                id: taskId,
                creationDate: Date.now(),
                title: this.title.trim(),
                description: this.description.trim(),
                dueDate: this.dueDate.getTime(),
                location: { ...this.location },
                status: this.status,
            });

            for (const att of this.pendingAttachments) {
                await attachmentStore.addAttachment({ ...att, taskId });
            }

            runInAction(() => {
                this.isSubmitting = false;
                this.isModalVisible = false;
            });

            return { ok: true, warning };
        } catch (error) {
            console.error('Failed to create task', error);
            runInAction(() => {
                this.isSubmitting = false;
                this.submitError =
                    error instanceof Error ? error.message : 'Failed to create task. Please try again.';
            });
            return { ok: false };
        }
    };
}

const taskAddingStore = new TaskAddingStore(taskStore);

const taskAddingContext = createContext(taskAddingStore);

export const useTaskAddingStore = () => useContext(taskAddingContext);
