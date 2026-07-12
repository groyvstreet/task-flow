import { taskStore, TaskStore } from "@/entities/task";
import { Task } from "@/entities/task/model/types";
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

    constructor(taskStore: TaskStore) {
        this.taskStore = taskStore;
        makeAutoObservable(this);
    }

    toggleModalVisibility = () => this.isModalVisible = !this.isModalVisible;

    setTitle = (title: Task['title']) => this.title = title;

    setDescription = (description: Task['description']) => this.description = description;

    setDueDate = (dueDate: Date) => this.dueDate = dueDate;

    setLocation = (location: Task['location']) => this.location = location;

    setStatus = (status: Task['status']) => this.status = status;

    addTask = async () => {
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
    };
}

const taskAddingStore = new TaskAddingStore(taskStore);

const taskAddingContext = createContext(taskAddingStore);

export const useTaskAddingStore = () => useContext(taskAddingContext);
