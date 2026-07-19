import { TasksHeader } from '@/src/widgets/tasks-header';
import { TaskAdding } from '@/src/features/task-adding';
import { TaskSorting } from '@/src/features/task-sorting';
import { TaskList } from '@/src/entities/task';
import { useThemeColors } from '@/src/shared/theme';
import { observer } from 'mobx-react-lite';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const TasksPage = observer(() => {
    const colors = useThemeColors();

    return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
            <TasksHeader />
            <TaskSorting />
            <TaskList />
            <TaskAdding />
        </SafeAreaView>
    );
});

const styles = StyleSheet.create({
    safe: { flex: 1 },
});
