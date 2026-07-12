import { TaskList } from "@/entities/task";
import { TaskAdding } from "@/features/task-adding";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const TasksScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <TaskList />
            <TaskAdding style={styles.taskAdding} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    taskAdding: {
        position: 'absolute',
        bottom: 20,
        right: 20
    }
});
