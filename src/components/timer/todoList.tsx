import { useEffect, useState } from "react";
import { addTask, getTasks, removeTask } from "../../services/session_service";
import type { Task } from "../../types";

function TodoList() {
    const [newTask, setNewTask] = useState("");
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        getTasks().then(setTasks);
    }, []);

    const handleaAddTask = async () => {
        if (newTask.trim() === "") return;

        await addTask(newTask);
        setTasks(await getTasks());
        setNewTask("");
    };

    const deleteTask = async (id: number) => {
        await removeTask(id);
        setTasks(await getTasks());
    };

    return (
        <div className="todo">
            <div className="todo-header">
                <div>
                    <p className="todo-label">À FAIRE</p>
                    <h2>Mes tâches</h2>
                </div>

                <span className="task-count">
                    {tasks.length}
                </span>
            </div>

            <div className="task-input-wrapper">
                <input
                    type="text"
                    placeholder="Ajouter une tâche..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleaAddTask();
                        }
                    }}
                />

                <button onClick={handleaAddTask} aria-label="Ajouter la tâche">
                    +
                </button>
            </div>

            <ul className="task-list">
                {tasks.length === 0 ? (
                    <li className="empty-tasks">
                        <span>✦</span>
                        Rien à faire pour l’instant.
                    </li>
                ) : (
                    tasks.map((task) => (
                        <li className="task" key={task.id}>
                            <span className="task-dot" />

                            <span className="task-text">
                                {task.description}
                            </span>

                            <button
                                className="delete-task"
                                onClick={() => deleteTask(task.id)}
                                aria-label={`Supprimer ${task.description}`}
                            >
                                ×
                            </button>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

export default TodoList;