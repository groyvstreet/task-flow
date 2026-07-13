import { Link } from "expo-router";
import { Task } from "../model/types";
import { useTaskStore } from "../model/store";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from "@/components/ui/button";

type Props = {
    task: Task;
};

export const TaskCard = ({ task }: Props) => {
    const taskStore = useTaskStore();

    const removeTask = () => taskStore.removeTask(task);

    return (
        <Card>
            <Heading>{task.title}</Heading>
            <Text>Description: {task.description}</Text>
            <Text>Due date: {task.dueDate}</Text>
            <Text>Location: {task.location}</Text>
            <Text>Status: {task.status}</Text>
            <Link href={`/{task.id}`}>
                <Button>
                    <ButtonText>Open</ButtonText>
                </Button>
            </Link>
            <Button onPress={removeTask}>
                <ButtonText>Remove</ButtonText>
            </Button>
        </Card>
    );
};
