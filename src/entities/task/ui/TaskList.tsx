import { FlatList, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useTaskStore } from '../model/store';
import { TaskCard } from './TaskCard';
import { observer } from 'mobx-react-lite';
import { EmptyState } from '@/src/shared/ui';
import { useThemeColors } from '@/src/shared/theme';

export const TaskList = observer(() => {
    const taskStore = useTaskStore();
    const colors = useThemeColors();

    if (taskStore.isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.accent} />
            </View>
        );
    }

    if (taskStore.tasks.length === 0) {
        return <EmptyState />;
    }

    return (
        <FlatList
            contentContainerStyle={styles.content}
            data={taskStore.sortedTasks}
            renderItem={({ item }) => <TaskCard task={item} />}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
        />
    );
});

const styles = StyleSheet.create({
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 4,
        gap: 10,
        paddingBottom: 120,
    },
});
