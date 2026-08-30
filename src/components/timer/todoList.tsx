import { useState } from "react";

function TodoList() {
    const [newTask, setNewTask] = useState("");
    const [tasks, setTasks] = useState<string[]>([]);

    const addTask = () => {
        if (newTask.trim() === "") return;

        setTasks([...tasks, newTask.trim()]);
        setNewTask("");
    };

    const deleteTask = (index: number) => {
        setTasks(tasks.filter((_, i) => i !== index));
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
                            addTask();
                        }
                    }}
                />

                <button onClick={addTask} aria-label="Ajouter la tâche">
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
                    tasks.map((task, index) => (
                        <li className="task" key={index}>
                            <span className="task-dot" />

                            <span className="task-text">
                                {task}
                            </span>

                            <button
                                className="delete-task"
                                onClick={() => deleteTask(index)}
                                aria-label={`Supprimer ${task}`}
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