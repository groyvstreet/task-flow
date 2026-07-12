import { createContext, useContext } from "react";
import { Task } from "./types";
import { makeAutoObservable, runInAction } from "mobx";
import { TaskService } from "../api/service";
import AsyncStorage from '@react-native-async-storage/async-storage';

export class TaskStore {
    private taskService: TaskService;

    tasks: Array<Task> = [];

    constructor(taskService: TaskService) {
        this.taskService = taskService;
        makeAutoObservable(this);
    }

    init = async () => {
        const data = await AsyncStorage.getItem('tasks');

        if (!data) return;

        runInAction(() => {
            this.tasks = JSON.parse(data);
        });
    };

    private saveTasks = async () => {
        await AsyncStorage.setItem('tasks', JSON.stringify(this.tasks));
    };

    addTask = async (task: Task) => {
        this.tasks = [task, ...this.tasks];
        this.saveTasks();
    };

    updateTask = async (task: Task) => {
        this.tasks = this.tasks.map(t => t.id === task.id ? { ...task } : t);
        this.saveTasks();
    };

    removeTask = async (task: Task) => {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
        this.saveTasks();
    };
}

export const taskStore = new TaskStore(new TaskService());

const taskContext = createContext(taskStore);

export const useTaskStore = () => useContext(taskContext);
