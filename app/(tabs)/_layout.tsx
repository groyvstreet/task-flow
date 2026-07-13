import { Tabs } from 'expo-router';
import { ClipboardList, History, Map } from 'lucide-react-native';
import { themeStore } from '@/src/features/theme-toggle/model/store';
import { observer } from 'mobx-react-lite';

const TabsLayout = observer(() => {
    const isDark = themeStore.mode === 'dark';

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#0f766e',
                tabBarInactiveTintColor: isDark ? '#94a3b8' : '#64748b',
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                tabBarStyle: {
                    backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    borderTopColor: isDark ? '#1e293b' : '#e2e8f0',
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 6,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Tasks',
                    tabBarIcon: ({ color, size }) => (
                        <ClipboardList color={color} size={size} />
                    ),
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Map',
                    tabBarIcon: ({ color, size }) => <Map color={color} size={size} />,
                }}
            />
            <Tabs.Screen
                name="history"
                options={{
                    title: 'History',
                    tabBarIcon: ({ color, size }) => (
                        <History color={color} size={size} />
                    ),
                }}
            />
        </Tabs>
    );
});

export default TabsLayout;
