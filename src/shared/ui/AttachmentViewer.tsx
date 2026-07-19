import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Linking,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';

/** Structural viewer payload — no entity dependency */
export type FileViewerItem = {
    id: string;
    uri: string;
    name: string;
    mimeType: string;
    type: 'image' | 'pdf' | 'other';
};

type Props = {
    item: FileViewerItem | null;
    onClose: () => void;
};

const openLocalFile = async (uri: string, mimeType: string, name: string) => {
    if (Platform.OS === 'android') {
        const contentUri = await FileSystem.getContentUriAsync(uri);
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1,
            type: mimeType,
        });
        return;
    }

    if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
            mimeType,
            dialogTitle: name,
            UTI: mimeType === 'application/pdf' ? 'com.adobe.pdf' : undefined,
        });
        return;
    }

    const canOpen = await Linking.canOpenURL(uri);
    if (!canOpen) {
        throw new Error('unavailable');
    }
    await Linking.openURL(uri);
};

export const AttachmentViewer = ({ item, onClose }: Props) => {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [opening, setOpening] = useState(false);

    useEffect(() => {
        setLoading(true);
        setFailed(false);
        setOpening(false);
    }, [item?.id]);

    if (!item) return null;

    const isImage = item.type === 'image';

    const openExternally = async () => {
        setOpening(true);
        try {
            await openLocalFile(item.uri, item.mimeType, item.name);
        } catch {
            Alert.alert(
                'Cannot open file',
                'Install a PDF viewer app or try again. The file may be unavailable on this device.',
            );
        } finally {
            setOpening(false);
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
                        {item.name}
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
                                <Pressable
                                    style={styles.fallbackBtn}
                                    onPress={openExternally}
                                    disabled={opening}
                                >
                                    <Text style={styles.fallbackBtnText}>
                                        {opening ? 'Opening…' : 'Try open externally'}
                                    </Text>
                                </Pressable>
                            </View>
                        ) : (
                            <Image
                                source={{ uri: item.uri }}
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
                            {item.type === 'pdf' ? 'PDF document' : 'File attachment'}
                        </Text>
                        <Text style={styles.fallbackSub}>{item.mimeType}</Text>
                        <Pressable
                            style={styles.fallbackBtn}
                            onPress={openExternally}
                            disabled={opening}
                        >
                            {opening ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.fallbackBtnText}>Open file</Text>
                            )}
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
        minWidth: 140,
        paddingHorizontal: 20,
        borderRadius: 12,
        backgroundColor: '#171717',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fallbackBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },
});
