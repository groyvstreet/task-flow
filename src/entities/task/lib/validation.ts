import { TaskLocation } from '../model/types';

export type TaskFormFields = {
    title: string;
    description: string;
    dueDate: Date;
    location: TaskLocation;
};

export type ValidationErrors = Partial<Record<keyof TaskFormFields | 'dueDate', string>>;

export type ValidateTaskFormOptions = {
    isEditing?: boolean;
};

export const validateTaskForm = (
    fields: TaskFormFields,
    options?: ValidateTaskFormOptions,
): ValidationErrors => {
    const errors: ValidationErrors = {};

    if (!fields.title.trim()) {
        errors.title = 'Title is required';
    }
    if (!fields.description.trim()) {
        errors.description = 'Description is required';
    }
    if (!fields.location.address.trim()) {
        errors.location = 'Location is required';
    }
    if (!options?.isEditing && fields.dueDate.getTime() <= Date.now()) {
        errors.dueDate = 'Due date must be in the future';
    }

    return errors;
};

export const hasValidationErrors = (errors: ValidationErrors): boolean => {
    return Object.keys(errors).length > 0;
};
