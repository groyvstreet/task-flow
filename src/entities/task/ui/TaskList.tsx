import { FlatList, StyleSheet } from "react-native";
import { useTaskStore } from "../model/store";
import { TaskCard } from "./TaskCard";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";

export const TaskList = observer(() => {
    const taskStore = useTaskStore();

    useEffect(() => {
        taskStore.init();
    }, []);

    return (
        <FlatList
            contentContainerStyle={styles.content}
            data={taskStore.tasks}
            renderItem={({ item }) => <TaskCard task={item} />}       
            keyExtractor={(item) => item.id}
        />
    );
});

const styles = StyleSheet.create({
    content: {
        padding: 20,
        gap: 10,
        paddingBottom: 104
    }
});
