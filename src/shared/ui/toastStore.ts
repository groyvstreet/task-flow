import { makeAutoObservable, runInAction } from 'mobx';

export type ToastTone = 'success' | 'error' | 'warning' | 'info';

class ToastStore {
    visible = false;
    message = '';
    tone: ToastTone = 'info';
    private hideTimer: ReturnType<typeof setTimeout> | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    show = (message: string, tone: ToastTone = 'info', durationMs = 3200) => {
        if (this.hideTimer) clearTimeout(this.hideTimer);
        runInAction(() => {
            this.message = message;
            this.tone = tone;
            this.visible = true;
        });
        this.hideTimer = setTimeout(() => this.hide(), durationMs);
    };

    hide = () => {
        if (this.hideTimer) {
            clearTimeout(this.hideTimer);
            this.hideTimer = null;
        }
        runInAction(() => {
            this.visible = false;
        });
    };
}

export const toastStore = new ToastStore();
