import { useTaskStore } from "@/entities/task";
import { Stack } from "expo-router";
import { useEffect } from "react";

export default function RootLayout() {
    const taskStore = useTaskStore();

    useEffect(() => {
        taskStore.init();
    }, []);

    return <Stack screenOptions={{ header: () => {} }} />;
}
