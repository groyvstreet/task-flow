import { Modal, StyleProp, View, ViewStyle } from "react-native";
import { useTaskAddingStore } from "../model/store";
import { observer } from "mobx-react-lite";
import { DateTimePicker } from "@/src/shared/ui";
import { Fab, FabIcon } from "@/components/ui/fab";
import { PlusIcon } from "lucide-react-native";
import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Box } from "@/components/ui/box";
import { FormControl, FormControlError, FormControlErrorText } from "@/components/ui/form-control";
import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger } from "@/components/ui/select";
import { ChevronDownIcon } from "@/components/ui/icon";

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
                    <FormControl isInvalid={taskAddingStore.isInvalid}>
                        <Input>
                            <InputField
                                placeholder="Title"
                                value={taskAddingStore.title}
                                onChangeText={taskAddingStore.setTitle}
                            />
                        </Input>
                        <FormControlError>
                            <FormControlErrorText>Must be filled</FormControlErrorText>
                        </FormControlError>
                    </FormControl>
                    <Input>
                        <InputField
                            placeholder="Description"
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
                            placeholder="Location"
                            value={taskAddingStore.location}
                            onChangeText={taskAddingStore.setLocation}
                        />
                    </Input>
                    <Select selectedValue={taskAddingStore.status} onValueChange={taskAddingStore.setStatus}>
                        <SelectTrigger>
                            <SelectInput
                                placeholder="Select status"
                            />
                            <SelectIcon className="mr-3" as={ChevronDownIcon} />
                        </SelectTrigger>
                        <SelectPortal>
                            <SelectBackdrop />
                            <SelectContent>
                                <SelectDragIndicatorWrapper>
                                    <SelectDragIndicator />
                                </SelectDragIndicatorWrapper>
                                <SelectItem label="New" value="new" />
                                <SelectItem label="In Progress" value="in-progress" />
                                <SelectItem label="Completed" value="completed" />
                                <SelectItem label="Cancelled" value="cancelled" />
                            </SelectContent>
                        </SelectPortal>
                    </Select>
                    <Button onPress={taskAddingStore.addTask}>
                        <ButtonText>Add</ButtonText>
                    </Button>
                </Box>
            </Modal>
        </View>
    );
})
