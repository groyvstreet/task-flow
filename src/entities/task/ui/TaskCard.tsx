import { Link } from "expo-router";
import { Task } from "../model/types";
import { Button, Card, Text } from "react-native-paper";
import { useTaskStore } from "../model/store";

type Props = {
    task: Task;
};

export const TaskCard = ({ task }: Props) => {
    const taskStore = useTaskStore();

    const removeTask = () => taskStore.removeTask(task);

    return (
        <Card>
            <Card.Title
                title={task.title}
            />
            <Card.Content>
                <Text>Description: {task.description}</Text>
                <Text>Due date: {task.dueDate}</Text>
                <Text>Location: {task.location}</Text>
                <Text>Status: {task.status}</Text>
            </Card.Content>
            <Card.Actions>
                <Link href={`/{task.id}`}><Button>Open</Button></Link>
                <Button onPress={removeTask}>Remove</Button>
            </Card.Actions>
        </Card>
    );
};
