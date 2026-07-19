import { Action } from '../model/types';
import { firebaseClient } from '@/src/shared/api';

export class ActionService {
    getActions = async (): Promise<Action[]> => {
        const { data } = await firebaseClient.get<Record<string, Action> | null>('/actions.json');
        if (!data) return [];
        return Object.entries(data).map(([id, action]) => ({ ...action, id }));
    };

    addAction = async (action: Action): Promise<void> => {
        await firebaseClient.put(`/actions/${action.id}.json`, action);
    };

    clearAll = async (): Promise<void> => {
        await firebaseClient.delete('/actions.json');
    };
}
