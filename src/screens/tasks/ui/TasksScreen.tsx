import { Box } from "@/components/ui/box";
import { TaskList } from "@/src/entities/task";
import { TaskAdding } from "@/src/features/task-adding";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const TasksScreen = () => {
    return (
        <SafeAreaView style={styles.container}>
            <Box className="flex-1 bg-background">
                <TaskList />
                <TaskAdding />
            </Box>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});
