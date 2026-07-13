import { createContext, useContext } from "react";
import { Action } from "./types";
import { makeAutoObservable, runInAction } from "mobx";
import AsyncStorage from '@react-native-async-storage/async-storage';

export class ActionStore {
    actions: Array<Action> = [];
    taskId: string = '';

    constructor() {
        makeAutoObservable(this);
    }

    init = async () => {
        const data = await AsyncStorage.getItem('actions');

        if (!data) return;

        runInAction(() => {
            this.actions = JSON.parse(data);
        });
    };

    private saveActions = async () => {
        await AsyncStorage.setItem('actions', JSON.stringify(this.actions));
    };

    setTaskId = (taskId: string) => this.taskId = taskId;

    addAction = async (action: Action) => {
        this.actions = [action, ...this.actions];
        this.saveActions();
    };

    updateAction = async (action: Action) => {
        this.actions = this.actions.map(a => a.id === action.id ? { ...action } : a);
        this.saveActions();
    };

    removeAction = async (action: Action) => {
        this.actions = this.actions.filter(a => a.id !== action.id);
        this.saveActions();
    };

    get actionsByTaskId() {
        return this.actions.filter(a => a.taskId === this.taskId);
    }
}

export const actionStore = new ActionStore();

const actionContext = createContext(actionStore);

export const useActionStore = () => useContext(actionContext);
