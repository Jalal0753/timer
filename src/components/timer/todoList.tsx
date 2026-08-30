import { useState } from "react";

function TodoList() {
    const [newTask, setNewTask] = useState("");
    const [tasks, setTasks] = useState<string[]>([]);

    const addTask = () => {
        if (newTask.trim() === "") return;

        setTasks([...tasks, newTask]);
        setNewTask("");
    };

    const deleteTask = (index: number) => {
        setTasks(tasks.filter((_, i) => i !== index));
    };

    return (
        <div>
            <h2>Mes tâches</h2>

            <input
                type="text"
                placeholder="Ajouter une tâche..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        addTask();
                    }
                }}
            />

            <button onClick={addTask}>
                Ajouter
            </button>

            <ul>
                {tasks.map((task, index) => (
                    <li key={index}>
                        {task}

                        <button onClick={() => deleteTask(index)}>
                            Supprimer
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default TodoList;
