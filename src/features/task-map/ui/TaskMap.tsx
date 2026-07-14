import { observer } from 'mobx-react-lite';
import MapView, { Callout, Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import { useTaskStore } from '@/src/entities/task';
import { EmptyState, TaskStatusBadge } from '@/src/shared/ui';
import { router } from 'expo-router';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { isGoogleMapsConfigured } from '@/src/shared/lib/maps';
import { MapPin } from 'lucide-react-native';
import { formatDateTime } from '@/src/shared/lib/format';
import { TASK_STATUS_LABELS, Task } from '@/src/entities/task/model/types';
import { useMemo, useState } from 'react';

const DEFAULT_REGION: Region = {
    latitude: 40.7128,
    longitude: -74.006,
    latitudeDelta: 0.18,
    longitudeDelta: 0.18,
};

const LocationList = observer(({ tasks }: { tasks: Task[] }) => {
    if (tasks.length === 0) {
        return (
            <EmptyState
                title="No located tasks"
                message="Add an address or coordinates when creating or editing a task"
            />
        );
    }

    return (
        <FlatList
            data={tasks}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
                <Pressable style={styles.listItem} onPress={() => router.push(`/${item.id}`)}>
                    <View style={styles.listIcon}>
                        <MapPin size={18} color="#0f766e" />
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                        <Text style={styles.listTitle}>{item.title}</Text>
                        <Text style={styles.listAddress}>{item.location.address}</Text>
                        <Text style={styles.listMeta}>Due {formatDateTime(item.dueDate)}</Text>
                    </View>
                    <TaskStatusBadge status={item.status} />
                </Pressable>
            )}
        />
    );
});

export const TaskMap = observer(() => {
    const taskStore = useTaskStore();
    const tasksWithCoords = taskStore.tasksWithLocation;
    const mapsReady = isGoogleMapsConfigured();
    const [forceMap, setForceMap] = useState(false);

    const initialRegion = useMemo(() => {
        if (tasksWithCoords.length === 0) return DEFAULT_REGION;
        const latitudes = tasksWithCoords.map(t => t.location.latitude!);
        const longitudes = tasksWithCoords.map(t => t.location.longitude!);
        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);
        return {
            latitude: (minLat + maxLat) / 2,
            longitude: (minLng + maxLng) / 2,
            latitudeDelta: Math.max(0.05, (maxLat - minLat) * 1.6 || 0.12),
            longitudeDelta: Math.max(0.05, (maxLng - minLng) * 1.6 || 0.12),
        } satisfies Region;
    }, [tasksWithCoords]);

    if (tasksWithCoords.length === 0) {
        return (
            <EmptyState
                title="No tasks on map"
                message="Add an address or coordinates when creating or editing a task"
            />
        );
    }

    const showNativeMap = mapsReady || forceMap;

    if (!showNativeMap) {
        return (
            <View style={styles.wrap}>
                <View style={styles.banner}>
                    <Text style={styles.bannerTitle}>Map needs a Google Maps API key</Text>
                    <Text style={styles.bannerText}>
                        Showing a location list instead. Add your key and rebuild (see README).
                    </Text>
                    <Pressable style={styles.tryBtn} onPress={() => setForceMap(true)}>
                        <Text style={styles.tryBtnText}>Try MapView anyway</Text>
                    </Pressable>
                </View>
                <LocationList tasks={tasksWithCoords} />
            </View>
        );
    }

    return (
        <View style={styles.mapWrap}>
            <MapView
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                mapType="standard"
                initialRegion={initialRegion}
                showsCompass
                showsScale
                loadingEnabled
                moveOnMarkerPress={false}
            >
                {tasksWithCoords.map(task => (
                    <Marker
                        key={task.id}
                        coordinate={{
                            latitude: task.location.latitude!,
                            longitude: task.location.longitude!,
                        }}
                        pinColor="#0f766e"
                        tracksViewChanges={false}
                        onCalloutPress={() => router.push(`/${task.id}`)}
                    >
                        <Callout tooltip onPress={() => router.push(`/${task.id}`)}>
                            <View style={styles.callout}>
                                <View style={styles.calloutAccent} />
                                <View style={styles.calloutBody}>
                                    <Text style={styles.calloutTitle} numberOfLines={2}>
                                        {task.title}
                                    </Text>
                                    <Text style={styles.calloutAddress} numberOfLines={2}>
                                        {task.location.address}
                                    </Text>
                                    <View style={styles.calloutMetaRow}>
                                        <View style={styles.calloutChip}>
                                            <Text style={styles.calloutChipText}>
                                                {TASK_STATUS_LABELS[task.status]}
                                            </Text>
                                        </View>
                                        <Text style={styles.calloutDue} numberOfLines={1}>
                                            Due {formatDateTime(task.dueDate)}
                                        </Text>
                                    </View>
                                    <Text style={styles.calloutHint}>Tap to open</Text>
                                </View>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>
        </View>
    );
});

const styles = StyleSheet.create({
    wrap: { flex: 1 },
    mapWrap: {
        flex: 1,
        backgroundColor: '#e5e7eb',
    },
    map: {
        flex: 1,
        width: '100%',
    },
    callout: {
        width: 260,
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#ccfbf1',
        ...Platform.select({
            ios: {
                shadowColor: '#0f172a',
                shadowOpacity: 0.18,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
            },
            android: {
                elevation: 6,
            },
        }),
    },
    calloutAccent: {
        width: 4,
        backgroundColor: '#0f766e',
    },
    calloutBody: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 4,
    },
    calloutTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
        letterSpacing: -0.2,
    },
    calloutAddress: {
        fontSize: 12,
        color: '#64748b',
        lineHeight: 16,
    },
    calloutMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
        flexWrap: 'wrap',
    },
    calloutChip: {
        backgroundColor: '#f0fdfa',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: '#99f6e4',
    },
    calloutChipText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#0f766e',
    },
    calloutDue: {
        flex: 1,
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '600',
    },
    calloutHint: {
        marginTop: 2,
        fontSize: 11,
        fontWeight: '600',
        color: '#0f766e',
    },
    banner: {
        backgroundColor: '#fffbeb',
        borderBottomWidth: 1,
        borderBottomColor: '#fde68a',
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 6,
    },
    bannerTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#92400e',
    },
    bannerText: {
        fontSize: 13,
        color: '#a16207',
        lineHeight: 18,
    },
    tryBtn: {
        alignSelf: 'flex-start',
        marginTop: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: '#fef3c7',
    },
    tryBtnText: {
        color: '#92400e',
        fontWeight: '700',
        fontSize: 13,
    },
    listContent: {
        padding: 16,
        gap: 10,
        paddingBottom: 24,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    listIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#f0fdfa',
        alignItems: 'center',
        justifyContent: 'center',
    },
    listTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#0f172a',
    },
    listAddress: {
        fontSize: 13,
        color: '#64748b',
    },
    listMeta: {
        fontSize: 12,
        color: '#94a3b8',
    },
});
