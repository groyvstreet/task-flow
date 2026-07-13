import { Attachment } from '../model/types';
import { AttachmentItem } from './AttachmentItem';
import { StyleSheet, Text, View } from 'react-native';
import { useThemeColors } from '@/src/shared/theme/useThemeColors';
import { observer } from 'mobx-react-lite';

type Props = {
    attachments: Attachment[];
    onDelete?: (attachment: Attachment) => void;
    title?: string;
};

export const AttachmentList = observer(({
    attachments,
    onDelete,
    title = 'Attachments',
}: Props) => {
    const colors = useThemeColors();

    if (!title && attachments.length === 0) return null;

    return (
        <View style={styles.wrap}>
            {title ? (
                <Text style={[styles.title, { color: colors.textMuted }]}>{title}</Text>
            ) : null}
            {attachments.length === 0 ? (
                title ? (
                    <Text style={[styles.empty, { color: colors.textMuted }]}>No attachments</Text>
                ) : null
            ) : (
                attachments.map(att => (
                    <AttachmentItem key={att.id} attachment={att} onDelete={onDelete} />
                ))
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    wrap: { gap: 8 },
    title: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    empty: { fontSize: 14 },
});
