import { FlatList, StyleSheet, View, ActivityIndicator } from 'react-native';
import { useTaskStore } from '../model/store';
import { TaskCard } from './TaskCard';
import { observer } from 'mobx-react-lite';
import { EmptyState } from '@/src/shared/ui';

export const TaskList = observer(() => {
    const taskStore = useTaskStore();

    if (taskStore.isLoading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#0f766e" />
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
        padding: 16,
        gap: 12,
        paddingBottom: 120,
    },
});
