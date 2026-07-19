import { observer } from 'mobx-react-lite';
import MapView, { Callout, Marker, PROVIDER_GOOGLE, type Region } from 'react-native-maps';
import {
    useTaskStore,
    TaskStatusBadge,
    TASK_STATUS_LABELS,
    type Task,
} from '@/src/entities/task';
import { EmptyState } from '@/src/shared/ui';
import { router } from 'expo-router';
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { isGoogleMapsConfigured } from '@/src/shared/lib';
import { MapPin } from 'lucide-react-native';
import { formatDateTime } from '@/src/shared/lib';
import { useThemeColors, Fonts } from '@/src/shared/theme';
import { useMemo, useState } from 'react';

const DEFAULT_REGION: Region = {
    latitude: 40.7128,
    longitude: -74.006,
    latitudeDelta: 0.18,
    longitudeDelta: 0.18,
};

/** ~12–20 m — enough to separate stacked pins without looking far from the address */
const OVERLAP_OFFSET_DEG = 0.00018;

type MapPinItem = {
    task: Task;
    coordinate: { latitude: number; longitude: number };
};

const coordKey = (lat: number, lng: number) => `${lat.toFixed(5)},${lng.toFixed(5)}`;

/** Spread tasks that share the same geocoded point so pins don't hide each other. */
const buildMapPins = (tasks: Task[]): MapPinItem[] => {
    const groups = new Map<string, Task[]>();

    for (const task of tasks) {
        const lat = task.location.latitude!;
        const lng = task.location.longitude!;
        const key = coordKey(lat, lng);
        const group = groups.get(key);
        if (group) group.push(task);
        else groups.set(key, [task]);
    }

    const pins: MapPinItem[] = [];

    for (const group of groups.values()) {
        if (group.length === 1) {
            const task = group[0];
            pins.push({
                task,
                coordinate: {
                    latitude: task.location.latitude!,
                    longitude: task.location.longitude!,
                },
            });
            continue;
        }

        group.forEach((task, index) => {
            const angle = (2 * Math.PI * index) / group.length - Math.PI / 2;
            const radius = OVERLAP_OFFSET_DEG * (1 + Math.floor(index / 8) * 0.35);
            pins.push({
                task,
                coordinate: {
                    latitude: task.location.latitude! + radius * Math.cos(angle),
                    longitude: task.location.longitude! + radius * Math.sin(angle),
                },
            });
        });
    }

    return pins;
};

const LocationList = observer(({ tasks }: { tasks: Task[] }) => {
    const colors = useThemeColors();

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
                <Pressable
                    style={[styles.listItem, { backgroundColor: colors.surface }]}
                    onPress={() => router.push(`/${item.id}`)}
                >
                    <View style={[styles.listIcon, { backgroundColor: colors.surfaceMuted }]}>
                        <MapPin size={18} color={colors.text} strokeWidth={1.75} />
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                        <Text style={[styles.listTitle, { color: colors.text }]}>{item.title}</Text>
                        <Text style={[styles.listAddress, { color: colors.textMuted }]}>
                            {item.location.address}
                        </Text>
                        <Text style={[styles.listMeta, { color: colors.textMuted }]}>
                            Due {formatDateTime(item.dueDate)}
                        </Text>
                    </View>
                    <TaskStatusBadge status={item.status} />
                </Pressable>
            )}
        />
    );
});

export const MapPanel = observer(() => {
    const taskStore = useTaskStore();
    const colors = useThemeColors();
    const tasksWithCoords = taskStore.tasksWithLocation;
    const mapsReady = isGoogleMapsConfigured();
    const [forceMap, setForceMap] = useState(false);

    // Stable deps: MobX getter returns a new array every access.
    const pinDataSignature = tasksWithCoords
        .map(t => `${t.id}:${t.location.latitude}:${t.location.longitude}`)
        .join('|');

    const mapPins = useMemo(
        () => buildMapPins(tasksWithCoords),
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: pinDataSignature tracks content
        [pinDataSignature],
    );
    const pinIdsSignature = useMemo(() => mapPins.map(p => p.task.id).sort().join('|'), [mapPins]);

    const initialRegion = useMemo(() => {
        if (mapPins.length === 0) return DEFAULT_REGION;
        const latitudes = mapPins.map(p => p.coordinate.latitude);
        const longitudes = mapPins.map(p => p.coordinate.longitude);
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
    }, [mapPins]);

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
            <View style={[styles.wrap, { backgroundColor: colors.bg }]}>
                <View
                    style={[
                        styles.banner,
                        { backgroundColor: colors.warningBg, borderBottomColor: colors.border },
                    ]}
                >
                    <Text style={[styles.bannerTitle, { color: colors.warning }]}>
                        Map needs a Google Maps API key
                    </Text>
                    <Text style={[styles.bannerText, { color: colors.textMuted }]}>
                        Showing a location list instead. Add your key and rebuild (see README).
                    </Text>
                    <Pressable
                        style={[styles.tryBtn, { backgroundColor: colors.surface }]}
                        onPress={() => setForceMap(true)}
                    >
                        <Text style={[styles.tryBtnText, { color: colors.text }]}>
                            Try MapView anyway
                        </Text>
                    </Pressable>
                </View>
                <LocationList tasks={tasksWithCoords} />
            </View>
        );
    }

    return (
        <View style={[styles.mapWrap, { backgroundColor: colors.surfaceMuted }]}>
            {/*
              Remount MapView when the pin set changes. On Android (Fabric / RN 0.8x),
              incremental Marker add/remove often drops existing pins; a fresh native map
              with tracksViewChanges kept true is reliable for small task counts.
            */}
            <MapView
                key={pinIdsSignature}
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                mapType="standard"
                initialRegion={initialRegion}
                showsCompass
                showsScale
                loadingEnabled
                moveOnMarkerPress={false}
            >
                {mapPins.map(({ task, coordinate }) => (
                    <Marker
                        key={task.id}
                        identifier={task.id}
                        coordinate={coordinate}
                        pinColor="#171717"
                        tracksViewChanges
                    >
                        <Callout tooltip onPress={() => router.push(`/${task.id}`)}>
                            <View style={styles.callout}>
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
            <View style={styles.countBadge} pointerEvents="none">
                <Text style={styles.countBadgeText}>
                    {mapPins.length} pin{mapPins.length === 1 ? '' : 's'}
                </Text>
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    wrap: { flex: 1 },
    mapWrap: {
        flex: 1,
    },
    map: {
        flex: 1,
        width: '100%',
    },
    countBadge: {
        position: 'absolute',
        top: 12,
        alignSelf: 'center',
        backgroundColor: 'rgba(23, 23, 23, 0.82)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
    },
    countBadgeText: {
        color: '#FAFAFA',
        fontSize: 12,
        fontFamily: Fonts.medium,
    },
    callout: {
        width: 248,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#E5E5E5',
    },
    calloutBody: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 4,
    },
    calloutTitle: {
        fontSize: 15,
        fontFamily: Fonts.semibold,
        color: '#171717',
        letterSpacing: -0.2,
    },
    calloutAddress: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: '#737373',
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
        backgroundColor: '#F5F5F5',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    calloutChipText: {
        fontSize: 11,
        fontFamily: Fonts.semibold,
        color: '#404040',
    },
    calloutDue: {
        flex: 1,
        fontSize: 11,
        color: '#A3A3A3',
        fontFamily: Fonts.medium,
    },
    calloutHint: {
        marginTop: 2,
        fontSize: 11,
        fontFamily: Fonts.medium,
        color: '#171717',
    },
    banner: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 6,
    },
    bannerTitle: {
        fontSize: 14,
        fontFamily: Fonts.semibold,
    },
    bannerText: {
        fontSize: 13,
        fontFamily: Fonts.regular,
        lineHeight: 18,
    },
    tryBtn: {
        alignSelf: 'flex-start',
        marginTop: 4,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 10,
    },
    tryBtnText: {
        fontFamily: Fonts.semibold,
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
        borderRadius: 14,
        padding: 14,
    },
    listIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listTitle: {
        fontSize: 15,
        fontFamily: Fonts.semibold,
    },
    listAddress: {
        fontSize: 13,
        fontFamily: Fonts.regular,
    },
    listMeta: {
        fontSize: 12,
        fontFamily: Fonts.regular,
    },
});
