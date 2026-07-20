import { themeStore } from '@/src/features/theme-toggle';
import { getThemeColors } from '@/src/shared/theme';
import { Tabs } from 'expo-router';
import { ClipboardList, History, Map } from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import { StyleSheet } from 'react-native';

const TabsLayout = observer(() => {
    const colors = getThemeColors(themeStore.mode);

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarShowLabel: false,
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    height: 52,
                    paddingBottom: 4,
                    paddingTop: 4,
                    elevation: 0,
                    shadowOpacity: 0,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Tasks',
                    tabBarIcon: ({ color, size }) => (
                        <ClipboardList color={color} size={size} strokeWidth={1.75} />
                    ),
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Map',
                    tabBarIcon: ({ color, size }) => (
                        <Map color={color} size={size} strokeWidth={1.75} />
                    ),
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, size }) => (
                        <History color={color} size={size} strokeWidth={1.75} />
                    ),
                }}
            />
        </Tabs>
    );
});

export default TabsLayout;
