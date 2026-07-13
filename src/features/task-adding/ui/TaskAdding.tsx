import { Modal, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { useTaskAddingStore } from "../model/store";
import { observer } from "mobx-react-lite";
import { DateTimePicker } from "@/src/shared/ui";
import { Fab, FabIcon } from "@/components/ui/fab";
import { PlusIcon } from "lucide-react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Box } from "@/components/ui/box";

type Props = {
    style?: StyleProp<ViewStyle>;
};

export const TaskAdding = observer(({ style }: Props) => {
    const taskAddingStore = useTaskAddingStore();

    return (
        <View style={style}>
            <Fab
                onPress={taskAddingStore.toggleModalVisibility}
                //className="m-6"
                //size="lg"
            >
                <FabIcon as={PlusIcon} />
            </Fab>
            <Modal
                visible={taskAddingStore.isModalVisible}
                animationType="slide"
            >
                <Box className="flex-1 bg-background p-6 gap-3">
                    <Button onPress={taskAddingStore.toggleModalVisibility}>
                        <ButtonText>Back</ButtonText>
                    </Button>
                    <Input>
                        <InputField
                            //label="Title"
                            value={taskAddingStore.title}
                            onChangeText={taskAddingStore.setTitle}
                        />
                    </Input>
                    <Input>
                        <InputField
                            //label="Description"
                            value={taskAddingStore.description}
                            onChangeText={taskAddingStore.setDescription}
                        />
                    </Input>
                    <DateTimePicker
                        value={taskAddingStore.dueDate}
                        onValueChange={taskAddingStore.setDueDate}
                        minimumDate={new Date()}
                    />
                    <Input>
                        <InputField
                            //label="Location"
                            value={taskAddingStore.location}
                            onChangeText={taskAddingStore.setLocation}
                        />
                    </Input>
                    <Input>
                        <InputField
                            label="Status"
                            value={taskAddingStore.status}
                            onChangeText={taskAddingStore.setStatus}
                        />
                    </Input>
                    <Button onPress={taskAddingStore.addTask}>
                        <ButtonText>Add</ButtonText>
                    </Button>
                </Box>
            </Modal>
        </View>
    );
})
