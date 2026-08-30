import { useEffect, useState } from "react";
import TodoList from "./todoList";
import "./Timer.css";

function Timer() {
    const [focusMinutes, setFocusMinutes] = useState(25);
    const [seconds, setSeconds] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            setSeconds((current) => {
                if (current <= 1) {
                    setIsRunning(false);
                    return 0;
                }

                return current - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning]);

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;

    const toggleTimer = () => {
        if (seconds === 0) {
            setSeconds(focusMinutes * 60);
        }

        setIsRunning((current) => !current);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setSeconds(focusMinutes * 60);
    };

    const changeFocusDuration = (value: number) => {
        const newDuration = Math.max(10, value || 10);

        setFocusMinutes(newDuration);
        setSeconds(newDuration * 60);
        setIsRunning(false);
    };

    return (
        <main className="study-app">
            <div className="desk-lamp-glow" />

            <section className="timer-card">
                <div className="lamp">
                    <div className="lamp-light" />
                </div>

                <p className="eyebrow">SESSION DE CONCENTRATION</p>

                <div className={`timer ${isRunning ? "timer-running" : ""}`}>
                    {formattedTime}
                </div>

                <p className="timer-message">
                    {isRunning
                        ? ""
                        : seconds === 0
                        ? "Session terminée. Bien joué."
                        : ""}
                </p>

                <div className="timer-actions">
                    <button
                        className="primary-button"
                        onClick={toggleTimer}
                    >
                        <span className="button-icon">
                            {isRunning ? "Ⅱ" : "▶"}
                        </span>

                        {isRunning
                            ? "Pause"
                            : seconds === focusMinutes * 60
                            ? "Commencer"
                            : seconds === 0
                            ? "Recommencer"
                            : "Reprendre"}
                    </button>

                    <button
                        className="secondary-button"
                        onClick={resetTimer}
                    >
                        Réinitialiser
                    </button>
                </div>

                <div className="duration">
                    <span>Durée</span>

                    <div className="duration-control">
                        <button
                            onClick={() =>
                                changeFocusDuration(focusMinutes - 5)
                            }
                            aria-label="Diminuer la durée"
                        >
                            −
                        </button>

                        <span>{focusMinutes} min</span>

                        <button
                            onClick={() =>
                                changeFocusDuration(focusMinutes + 5)
                            }
                            aria-label="Augmenter la durée"
                        >
                            +
                        </button>
                    </div>
                </div>
            </section>

            <section className="tasks-card">
                <TodoList />
            </section>

        </main>
    );
}

export default Timer;