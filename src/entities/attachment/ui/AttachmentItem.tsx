import { Attachment } from '../model/types';
import { FileText, ImageIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { AttachmentViewer } from '@/src/shared/ui';
import { useThemeColors } from '@/src/shared/theme';
import { observer } from 'mobx-react-lite';

type Props = {
    attachment: Attachment;
    onDelete?: (attachment: Attachment) => void;
};

export const AttachmentItem = observer(({ attachment, onDelete }: Props) => {
    const colors = useThemeColors();
    const [imageError, setImageError] = useState(false);
    const [viewerOpen, setViewerOpen] = useState(false);
    const showImage = attachment.type === 'image' && !imageError;

    return (
        <>
            <Pressable
                style={[
                    styles.row,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={() => setViewerOpen(true)}
                accessibilityRole="button"
                accessibilityLabel={`View ${attachment.name}`}
            >
                {showImage ? (
                    <Image
                        source={{ uri: attachment.uri }}
                        style={styles.thumb}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <View style={[styles.iconBox, { backgroundColor: colors.surfaceMuted }]}>
                        {attachment.type === 'pdf' ? (
                            <FileText size={20} color={colors.textMuted} />
                        ) : (
                            <ImageIcon size={20} color={colors.textMuted} />
                        )}
                    </View>
                )}
                <View style={styles.meta}>
                    <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                        {attachment.name}
                    </Text>
                    <Text style={[styles.hint, { color: colors.textMuted }]}>
                        {imageError ? 'File unavailable — tap to retry' : 'Tap to view'}
                    </Text>
                </View>
                {onDelete ? (
                    <Pressable
                        style={styles.remove}
                        onPress={e => {
                            e.stopPropagation?.();
                            onDelete(attachment);
                        }}
                    >
                        <Text style={[styles.removeText, { color: colors.danger }]}>Remove</Text>
                    </Pressable>
                ) : null}
            </Pressable>

            <AttachmentViewer
                item={viewerOpen ? attachment : null}
                onClose={() => setViewerOpen(false)}
            />
        </>
    );
});

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
    },
    thumb: {
        width: 48,
        height: 48,
        borderRadius: 8,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    meta: { flex: 1, gap: 2 },
    name: {
        fontSize: 14,
        fontWeight: '600',
    },
    hint: {
        fontSize: 12,
    },
    remove: {
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    removeText: {
        fontWeight: '600',
        fontSize: 13,
    },
});
