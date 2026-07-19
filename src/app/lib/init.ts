import { taskStore } from '@/src/entities/task';
import { actionStore } from '@/src/entities/action';
import { attachmentStore } from '@/src/entities/attachment';
import { themeStore } from '@/src/features/theme-toggle';
import { syncStore } from '@/src/features/sync';
import { prepareNotifications } from '@/src/shared/lib';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

export const initializeApp = async (): Promise<void> => {
    await Promise.all([
        taskStore.init(),
        actionStore.init(),
        attachmentStore.init(),
        themeStore.init(),
    ]);
    await syncStore.hydrateOnLaunch();
    void prepareNotifications();
};

export const setupNotificationHandlers = (): void => {
    Notifications.addNotificationResponseReceivedListener(response => {
        const taskId = response.notification.request.content.data?.taskId;
        if (typeof taskId === 'string' && taskId.length > 0) {
            router.push(`/${taskId}`);
        }
    });
};
