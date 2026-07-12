import { Modal, Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Button, FAB, TextInput } from "react-native-paper";
import { useTaskAddingStore } from "../model/store";
import { observer } from "mobx-react-lite";
import { DateTimePicker } from "@/shared/ui";

type Props = {
    style?: StyleProp<ViewStyle>;
};

export const TaskAdding = observer(({ style }: Props) => {
    const taskAddingStore = useTaskAddingStore();

    return (
        <View style={style}>
            <FAB
                style={[styles.fab]}
                icon="plus"
                onPress={taskAddingStore.toggleModalVisibility}
            />
            <Modal
                visible={taskAddingStore.isModalVisible}
                animationType="slide"
            >
                <Pressable style={styles.container} onPress={taskAddingStore.toggleModalVisibility}>
                    <TextInput
                        label="Title"
                        value={taskAddingStore.title}
                        onChangeText={taskAddingStore.setTitle}
                    />
                    <TextInput
                        label="Description"
                        value={taskAddingStore.description}
                        onChangeText={taskAddingStore.setDescription}
                    />
                    <DateTimePicker
                        value={taskAddingStore.dueDate}
                        onValueChange={taskAddingStore.setDueDate}
                        minimumDate={new Date()}
                    />
                    <TextInput
                        label="Location"
                        value={taskAddingStore.location}
                        onChangeText={taskAddingStore.setLocation}
                    />
                    <TextInput
                        label="Status"
                        value={taskAddingStore.status}
                        onChangeText={taskAddingStore.setStatus}
                    />
                    <Button mode="elevated" onPress={taskAddingStore.addTask}>Add</Button>
                </Pressable>
            </Modal>
        </View>
    );
})

const styles = StyleSheet.create({
    fab: {
        width: 64,
        height: 64,
        alignItems: 'center',
        justifyContent: 'center'
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 60,
        gap: 10
    }
});
