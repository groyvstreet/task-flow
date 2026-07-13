import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Linking,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { Attachment } from '@/src/entities/attachment/model/types';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
    attachment: Attachment | null;
    onClose: () => void;
};

export const AttachmentViewer = ({ attachment, onClose }: Props) => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    if (!attachment) return null;

    const isImage = attachment.type === 'image';

    const openExternally = async () => {
        try {
            const canOpen = await Linking.canOpenURL(attachment.uri);
            if (!canOpen) {
                Alert.alert('Cannot open file', 'This attachment is unavailable on this device.');
                return;
            }
            await Linking.openURL(attachment.uri);
        } catch {
            Alert.alert('Cannot open file', 'Failed to open this attachment.');
        }
    };

    return (
        <Modal visible transparent animationType="fade" onRequestClose={onClose}>
            <View
                style={[
                    styles.backdrop,
                    { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 },
                ]}
            >
                <View style={styles.header}>
                    <Text style={styles.title} numberOfLines={1}>
                        {attachment.name}
                    </Text>
                    <Pressable style={styles.close} onPress={onClose} accessibilityLabel="Close viewer">
                        <X size={20} color="#fff" />
                    </Pressable>
                </View>

                {isImage ? (
                    <View style={styles.imageWrap}>
                        {loading && !failed ? (
                            <ActivityIndicator color="#fff" size="large" style={styles.loader} />
                        ) : null}
                        {failed ? (
                            <View style={styles.fallback}>
                                <Text style={styles.fallbackText}>Image unavailable</Text>
                                <Pressable style={styles.fallbackBtn} onPress={openExternally}>
                                    <Text style={styles.fallbackBtnText}>Try open externally</Text>
                                </Pressable>
                            </View>
                        ) : (
                            <Image
                                source={{ uri: attachment.uri }}
                                style={styles.image}
                                resizeMode="contain"
                                onLoadStart={() => {
                                    setLoading(true);
                                    setFailed(false);
                                }}
                                onLoadEnd={() => setLoading(false)}
                                onError={() => {
                                    setLoading(false);
                                    setFailed(true);
                                }}
                            />
                        )}
                    </View>
                ) : (
                    <View style={styles.fallback}>
                        <Text style={styles.fallbackText}>
                            {attachment.type === 'pdf' ? 'PDF document' : 'File attachment'}
                        </Text>
                        <Text style={styles.fallbackSub}>{attachment.mimeType}</Text>
                        <Pressable style={styles.fallbackBtn} onPress={openExternally}>
                            <Text style={styles.fallbackBtnText}>Open file</Text>
                        </Pressable>
                    </View>
                )}
            </View>
        </Modal>
    );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.92)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    title: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    close: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width,
        height: height * 0.75,
    },
    loader: {
        position: 'absolute',
    },
    fallback: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 10,
    },
    fallbackText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    fallbackSub: {
        color: '#94a3b8',
        fontSize: 13,
    },
    fallbackBtn: {
        marginTop: 8,
        minHeight: 48,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: '#0f766e',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fallbackBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
});
