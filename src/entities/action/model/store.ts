import { createContext, useContext } from 'react';
import { Action, ActionType } from './types';
import { makeAutoObservable, runInAction } from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/src/shared/lib';
import { randomUUID } from 'expo-crypto';
import { requestAutoSync } from '@/src/shared/api';

type LogActionParams = {
    taskId: string;
    taskTitle?: string;
    type: ActionType;
    description: string;
    synced?: boolean;
};

export class ActionStore {
    actions: Action[] = [];
    historyClearPending = false;
    isLoading = false;

    constructor() {
        makeAutoObservable(this);
    }

    init = async () => {
        this.isLoading = true;
        const [data, clearPending] = await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.ACTIONS),
            AsyncStorage.getItem(STORAGE_KEYS.HISTORY_CLEAR_PENDING),
        ]);

        runInAction(() => {
            if (data) {
                this.actions = JSON.parse(data);
            }
            this.historyClearPending = clearPending === '1';
            this.isLoading = false;
        });
    };

    private saveActions = async () => {
        await AsyncStorage.setItem(STORAGE_KEYS.ACTIONS, JSON.stringify(this.actions));
    };

    private saveClearPending = async () => {
        if (this.historyClearPending) {
            await AsyncStorage.setItem(STORAGE_KEYS.HISTORY_CLEAR_PENDING, '1');
        } else {
            await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY_CLEAR_PENDING);
        }
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
        if (this.historyClearPending) {
            return;
        }

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

    clearAll = async () => {
        runInAction(() => {
            this.actions = [];
            this.historyClearPending = true;
        });
        await this.saveActions();
        await this.saveClearPending();
        requestAutoSync();
    };

    markHistoryClearSynced = async () => {
        runInAction(() => {
            this.historyClearPending = false;
        });
        await this.saveClearPending();
    };
}

export const actionStore = new ActionStore();

const actionContext = createContext(actionStore);

export const useActionStore = () => useContext(actionContext);
