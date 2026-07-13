import { taskStore, TaskStore } from '@/src/entities/task';
import { Task } from '@/src/entities/task/model/types';
import { attachmentStore } from '@/src/entities/attachment/model/store';
import { Attachment } from '@/src/entities/attachment/model/types';
import { makeAutoObservable } from 'mobx';
import { createContext, useContext } from 'react';
import { randomUUID } from 'expo-crypto';
import {
    validateTaskForm,
    ValidationErrors,
    hasValidationErrors,
} from '@/src/shared/lib/validation';
import { LocationFormHelper } from '@/src/shared/lib/LocationFormHelper';

export class TaskUpdatingStore {
    private taskStore: TaskStore;
    readonly locationForm = new LocationFormHelper();

    originalTask: Task | null = null;
    isEditing = false;

    title = '';
    description = '';
    dueDate = new Date();
    status: Task['status'] = 'new';
    pendingAttachments: Attachment[] = [];
    existingAttachments: Attachment[] = [];
    errors: ValidationErrors = {};

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

    get currentTask(): Task | null {
        return this.originalTask;
    }

    setTaskById = (id: string) => {
        const task = this.taskStore.getTaskById(id);
        if (!task) return;

        this.originalTask = task;
        this.title = task.title;
        this.description = task.description;
        this.dueDate = new Date(task.dueDate);
        this.locationForm.resetLocation({ ...task.location });
        this.status = task.status;
        this.existingAttachments = attachmentStore.getByTaskId(id);
        this.pendingAttachments = [];
        this.errors = {};
        this.isEditing = false;
    };

    startEditing = () => {
        this.isEditing = true;
    };

    cancelEditing = () => {
        if (this.originalTask) {
            this.setTaskById(this.originalTask.id);
        }
    };

    setTitle = (title: string) => {
        this.title = title;
    };

    setDescription = (description: string) => {
        this.description = description;
    };

    setDueDate = (dueDate: Date) => {
        this.dueDate = dueDate;
    };

    setLocationAddress = (address: string) => {
        this.locationForm.setLocationAddress(address);
        if (this.errors.location) this.errors = { ...this.errors, location: undefined };
    };

    setLocationCoordinateFields = (latitudeText: string, longitudeText: string) => {
        this.locationForm.setLocationCoordinateFields(latitudeText, longitudeText);
    };

    /** @deprecated use setLocationCoordinateFields — kept for call-site compatibility */
    setLocationCoordinates = (latitude: string, longitude: string) => {
        this.setLocationCoordinateFields(latitude, longitude);
    };

    setStatus = (status: string) => {
        this.status = status as Task['status'];
    };

    addPendingAttachment = (attachment: Omit<Attachment, 'id' | 'taskId' | 'createdAt'>) => {
        if (!this.originalTask) return;
        this.pendingAttachments = [
            ...this.pendingAttachments,
            {
                ...attachment,
                id: randomUUID(),
                taskId: this.originalTask.id,
                createdAt: Date.now(),
            },
        ];
    };

    removePendingAttachment = (id: string) => {
        this.pendingAttachments = this.pendingAttachments.filter(a => a.id !== id);
    };

    removeExistingAttachment = async (attachment: Attachment) => {
        await attachmentStore.removeAttachment(attachment);
        this.existingAttachments = attachmentStore.getByTaskId(attachment.taskId);
    };

    updateTask = async () => {
        this.errors = validateTaskForm(
            {
                title: this.title,
                description: this.description,
                dueDate: this.dueDate,
                location: this.location,
            },
            { isEditing: true },
        );

        if (hasValidationErrors(this.errors) || !this.originalTask) return;

        const updatedTask: Task = {
            ...this.originalTask,
            title: this.title.trim(),
            description: this.description.trim(),
            dueDate: this.dueDate.getTime(),
            location: { ...this.location },
            status: this.status,
        };

        await this.taskStore.updateTask(updatedTask);

        for (const att of this.pendingAttachments) {
            await attachmentStore.addAttachment(att);
        }

        this.originalTask = updatedTask;
        this.existingAttachments = attachmentStore.getByTaskId(updatedTask.id);
        this.pendingAttachments = [];
        this.isEditing = false;
    };

    updateStatus = async (status: Task['status']) => {
        if (!this.originalTask) return;
        await this.taskStore.updateStatus(this.originalTask.id, status);
        this.setTaskById(this.originalTask.id);
    };

    deleteTask = async () => {
        if (!this.originalTask) return;
        await this.taskStore.removeTask(this.originalTask);
    };

    get isInvalid(): boolean {
        return hasValidationErrors(this.errors);
    }

    get allAttachments(): Attachment[] {
        return [...this.existingAttachments, ...this.pendingAttachments];
    }
}

const taskUpdatingStore = new TaskUpdatingStore(taskStore);

const taskUpdatingContext = createContext(taskUpdatingStore);

export const useTaskUpdatingStore = () => useContext(taskUpdatingContext);
