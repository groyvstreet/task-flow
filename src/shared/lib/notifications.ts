import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';
import { DEMO_NOTIFICATION_DELAY_SECONDS, NOTIFICATION_MINUTES_BEFORE } from './constants';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export type NotificationScheduleResult = {
    notificationId: string | null;
    warning?: string;
};

const CHANNEL_ID = 'task-reminders';

export const NOTIFICATION_TOO_SOON_MESSAGE = `Reminder will not be scheduled because less than ${NOTIFICATION_MINUTES_BEFORE} minutes remain until the due date.`;

export const canScheduleDueReminder = (dueDate: number, now = Date.now()): boolean => {
    return dueDate - now >= NOTIFICATION_MINUTES_BEFORE * 60_000;
};

const ensureAndroidChannel = async () => {
    if (Platform.OS !== 'android') return;
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: 'Task Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
    });
};

export const prepareNotifications = async (): Promise<void> => {
    try {
        await ensureAndroidChannel();
        await requestNotificationPermissions();
    } catch (error) {
        console.warn('prepareNotifications failed', error);
    }
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
    try {
        await ensureAndroidChannel();
        const { status: existing } = await Notifications.getPermissionsAsync();
        if (existing === 'granted') return true;
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted';
    } catch (error) {
        console.warn('Notification permission request failed', error);
        return false;
    }
};

export const scheduleTaskNotification = async (
    taskId: string,
    title: string,
    dueDate: number,
): Promise<NotificationScheduleResult> => {
    try {
        if (!canScheduleDueReminder(dueDate)) {
            return {
                notificationId: null,
                warning: NOTIFICATION_TOO_SOON_MESSAGE,
            };
        }

        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
            return { notificationId: null, warning: 'Notification permission denied' };
        }

        const triggerDate = new Date(dueDate - NOTIFICATION_MINUTES_BEFORE * 60_000);
        if (triggerDate.getTime() <= Date.now()) {
            return {
                notificationId: null,
                warning: NOTIFICATION_TOO_SOON_MESSAGE,
            };
        }

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Task Reminder',
                body: `"${title}" is due in ${NOTIFICATION_MINUTES_BEFORE} minutes`,
                data: { taskId },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate,
                channelId: CHANNEL_ID,
            },
        });

        return { notificationId };
    } catch (error) {
        console.warn('scheduleTaskNotification failed', error);
        return {
            notificationId: null,
            warning: 'Task saved, but notification could not be scheduled on this device',
        };
    }
};

export const cancelTaskNotification = async (notificationId?: string) => {
    if (!notificationId) return;
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
        console.warn('cancelTaskNotification failed', error);
    }
};

export const cancelAllScheduledNotifications = async () => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
        console.warn('cancelAllScheduledNotifications failed', error);
    }
};

export const scheduleDemoNotification = async (
    taskId: string,
    title: string,
): Promise<NotificationScheduleResult> => {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
        return {
            notificationId: null,
            warning: 'Notification permission denied. Enable notifications in system settings.',
        };
    }

    const content = {
        title: 'Task Reminder (Demo)',
        body: `Demo reminder for "${title}"`,
        data: { taskId, demo: true },
    };

    const schedulePromise = Notifications.scheduleNotificationAsync({
        content,
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: DEMO_NOTIFICATION_DELAY_SECONDS,
            channelId: CHANNEL_ID,
        },
    }).then(
        id => ({ ok: true as const, id }),
        error => {
            console.warn('scheduleDemoNotification failed', error);
            return { ok: false as const, error };
        },
    );

    const raced = await Promise.race([
        schedulePromise,
        new Promise<{ ok: false; timedOut: true }>(resolve => {
            setTimeout(() => resolve({ ok: false, timedOut: true }), 4000);
        }),
    ]);

    if (raced.ok) {
        return { notificationId: raced.id };
    }

    setTimeout(() => {
        void (async () => {
            try {
                await Notifications.scheduleNotificationAsync({
                    content,
                    trigger: null,
                });
            } catch {
                Alert.alert(content.title, content.body);
            }
        })();
    }, DEMO_NOTIFICATION_DELAY_SECONDS * 1000);

    return {
        notificationId: `demo-fallback-${Date.now()}`,
        warning:
            'Native schedule did not finish in time. Demo will alert in ~45s while the app stays open.',
    };
};
