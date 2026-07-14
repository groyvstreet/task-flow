import { createContext, useContext } from 'react';
import { Action, ActionType } from './types';
import { makeAutoObservable, runInAction } from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/src/shared/lib/constants';
import { randomUUID } from 'expo-crypto';
import { ActionService } from '../api/service';
import { requestAutoSync } from '@/src/shared/api/auto-sync';

type LogActionParams = {
    taskId: string;
    taskTitle?: string;
    type: ActionType;
    description: string;
    synced?: boolean;
};

export class ActionStore {
    private actionService: ActionService;

    actions: Action[] = [];
    isLoading = false;

    constructor(actionService: ActionService) {
        this.actionService = actionService;
        makeAutoObservable(this);
    }

    init = async () => {
        this.isLoading = true;
        const data = await AsyncStorage.getItem(STORAGE_KEYS.ACTIONS);

        runInAction(() => {
            if (data) {
                this.actions = JSON.parse(data);
            }
            this.isLoading = false;
        });
    };

    private saveActions = async () => {
        await AsyncStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(this.actions));
    };

    logAction = async (params: LogActionParams) => {
        const action: Action = {
            id: randomUUID(),
            taskId: params.taskId,
            taskTitle: params.taskTitle,
            type: params.type,
            description: params.description,
            timestamp: Date.now(),
            synced: params.synced ?? false,
        };

        runInAction(() => {
            this.actions = [action, ...this.actions];
        });
        await this.saveActions();
        if (!action.synced) {
            requestAutoSync();
        }
        return action;
    };

    markActionsSynced = async (actionIds: string[]) => {
        runInAction(() => {
            this.actions = this.actions.map(a =>
                actionIds.includes(a.id) ? { ...a, synced: true } : a,
            );
        });
        await this.saveActions();
    };

    mergeFromServer = async (serverActions: Action[]) => {
        const unsynced = this.actions.filter(a => !a.synced);
        const unsyncedIds = new Set(unsynced.map(a => a.id));
        const fromServer = serverActions
            .filter(a => !unsyncedIds.has(a.id))
            .map(a => ({ ...a, synced: true as const }));

        runInAction(() => {
            this.actions = [...unsynced, ...fromServer];
        });
        await this.saveActions();
    };

    get unsyncedActions(): Action[] {
        return this.actions.filter(a => !a.synced);
    }

    getActionsByTaskId = (taskId: string): Action[] => {
        return this.actions.filter(a => a.taskId === taskId);
    };

    get sortedActions(): Action[] {
        return [...this.actions].sort((a, b) => b.timestamp - a.timestamp);
    }
}

export const actionStore = new ActionStore(new ActionService());

const actionContext = createContext(actionStore);

export const useActionStore = () => useContext(actionContext);
