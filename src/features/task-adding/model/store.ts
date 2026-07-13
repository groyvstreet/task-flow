import { taskStore, TaskStore } from "@/src/entities/task";
import { Task } from "@/src/entities/task/model/types";
import { makeAutoObservable } from "mobx";
import { createContext, useContext } from "react";
import { randomUUID } from 'expo-crypto';

export class TaskAddingStore {
    private taskStore: TaskStore;

    isModalVisible: boolean = false;
    title: Task['title'] = '';
    description: Task['description'] = '';
    dueDate: Date = new Date();
    location: Task['location'] = '';
    attachments: Task['attachments'] = [];
    status: Task['status'] = 'new';
    check: boolean = false;

    constructor(taskStore: TaskStore) {
        this.taskStore = taskStore;
        makeAutoObservable(this);
    }

    private nullify = () => {
        this.title = '';
        this.description = '';
        this.dueDate = new Date();
        this.location = '';
        this.attachments = [];
        this.status = 'new';
        this.check = false;
    };

    toggleModalVisibility = () => {
        if (!this.isModalVisible) {
            this.nullify();
        }

        this.isModalVisible = !this.isModalVisible;
    }

    setTitle = (title: Task['title']) => this.title = title;

    setDescription = (description: Task['description']) => this.description = description;

    setDueDate = (dueDate: Date) => this.dueDate = dueDate;

    setLocation = (location: Task['location']) => this.location = location;

    setStatus = (status: string) => this.status = status as Task['status'];

    addTask = async () => {
        this.check = true;

        if (this.isInvalid) return;

        await this.taskStore.addTask({
            id: randomUUID(),
            creationDate: Date.now(),
            history: [],
            title: this.title,
            description: this.description,
            dueDate: this.dueDate.getTime(),
            location: this.location,
            attachments: this.attachments,
            status: this.status
        });
        this.toggleModalVisibility();
    };

    get isInvalid() {
        return this.check && this.title.trim().length === 0;
    }
}

const taskAddingStore = new TaskAddingStore(taskStore);

const taskAddingContext = createContext(taskAddingStore);

export const useTaskAddingStore = () => useContext(taskAddingContext);
