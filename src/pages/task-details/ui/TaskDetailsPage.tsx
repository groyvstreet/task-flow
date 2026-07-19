import { TaskUpdating } from '@/src/features/task-updating';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '@/src/shared/theme';
import { observer } from 'mobx-react-lite';

export const TaskDetailsPage = observer(() => {
    const { taskId } = useLocalSearchParams<{ taskId: string }>();
    const colors = useThemeColors();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top']}>
            <TaskUpdating id={Array.isArray(taskId) ? taskId[0] : taskId} />
        </SafeAreaView>
    );
});

const styles = StyleSheet.create({
    container: { flex: 1 },
});
