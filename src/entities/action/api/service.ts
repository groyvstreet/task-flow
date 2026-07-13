import { Action } from '../model/types';
import { firebaseClient } from '@/src/shared/api/client';

/**
 * Firebase Realtime Database REST API layer for action history.
 * Uncomment axios calls after configuring FIREBASE_BASE_URL.
 */
export class ActionService {
    getActions = async (): Promise<Action[]> => {
        // const { data } = await firebaseClient.get<Record<string, Action>>('/actions.json');
        // if (!data) return [];
        // return Object.entries(data).map(([id, action]) => ({ ...action, id }));
        return [];
    };

    addAction = async (action: Action): Promise<void> => {
        // await firebaseClient.put(`/actions/${action.id}.json`, action);
    };
}
