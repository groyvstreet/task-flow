import { format } from 'date-fns';

export const formatDateTime = (timestamp: number): string => {
    return format(new Date(timestamp), 'dd MMM yyyy, HH:mm');
};

export const formatDate = (timestamp: number): string => {
    return format(new Date(timestamp), 'dd MMM yyyy');
};

export const formatTime = (timestamp: number): string => {
    return format(new Date(timestamp), 'HH:mm');
};

export const formatRelative = (timestamp: number): string => {
    const diff = timestamp - Date.now();
    const minutes = Math.round(diff / 60000);
    if (minutes < 0) return 'Overdue';
    if (minutes < 60) return `In ${minutes} min`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `In ${hours}h`;
    const days = Math.round(hours / 24);
    return `In ${days}d`;
};
