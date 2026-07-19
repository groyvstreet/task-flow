import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Attachment, AttachmentType } from '../model/types';

const getAttachmentType = (mimeType: string): AttachmentType => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    return 'other';
};

export const pickImage = async (): Promise<Omit<Attachment, 'id' | 'taskId' | 'createdAt'> | null> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return null;

    const asset = result.assets[0];
    return {
        uri: asset.uri,
        name: asset.fileName ?? 'image.jpg',
        mimeType: asset.mimeType ?? 'image/jpeg',
        type: getAttachmentType(asset.mimeType ?? 'image/jpeg'),
    };
};

export const pickDocument = async (): Promise<Omit<Attachment, 'id' | 'taskId' | 'createdAt'> | null> => {
    const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets[0]) return null;

    const asset = result.assets[0];
    return {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType ?? 'application/octet-stream',
        type: getAttachmentType(asset.mimeType ?? 'application/octet-stream'),
    };
};
