import { taskStore } from '@/src/entities/task/model/store';
import { actionStore } from '@/src/entities/action/model/store';
import { attachmentStore } from '@/src/entities/attachment/model/store';
import { themeStore } from '@/src/features/theme-toggle/model/store';
import { prepareNotifications } from '@/src/shared/lib/notifications';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';

export const initializeApp = async (): Promise<void> => {
    await Promise.all([
        taskStore.init(),
        actionStore.init(),
        attachmentStore.init(),
        themeStore.init(),
    ]);
    // Warm up channel + permission outside create/edit so save never blocks on the system dialog.
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
