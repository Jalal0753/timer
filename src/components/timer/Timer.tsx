import { useEffect, useState } from "react";
import TodoList from "./todoList";
import "./Timer.css";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";

type TimerMode = "focus" | "pomodoro";
type PomodoroPhase = "focus" | "break" | "longBreak";

function Timer() {
    const [mode, setMode] = useState<TimerMode>("focus");
    const [focusMinutes, setFocusMinutes] = useState(25);

    const [pomodoroFocusMinutes, setPomodoroFocusMinutes] = useState(0.1);
    const [pomodoroBreakMinutes, setPomodoroBreakMinutes] = useState(0.1);
    const [pomodoroLongBreakMinutes, setPomodoroLongBreakMinutes] = useState(0.2);
    const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>("focus");
    const [pomodoroSession, setPomodoroSession] = useState(0);

    const [seconds, setSeconds] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);

    const getCurrentDuration = () => {
        if (mode === "focus") {
            return focusMinutes * 60;
        }

        if (pomodoroPhase === "focus") {
            return pomodoroFocusMinutes * 60;
        }

        if (pomodoroPhase === "break") {
            return pomodoroBreakMinutes * 60;
        }

        return pomodoroLongBreakMinutes * 60;
    };

    useEffect(() => {
        if (!isRunning) return;

        const interval = setInterval(() => {
            setSeconds((currentSeconds) => {
                if (currentSeconds > 1) {
                    return currentSeconds - 1;
                }

                return 0;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isRunning]);

    useEffect(() => {
        if (!isRunning || seconds !== 0 || mode !== "pomodoro") {
            return;
        }

        if (pomodoroPhase === "focus") {
            const newSession = pomodoroSession + 1;

            setPomodoroSession(newSession);

            if (newSession >= 4) {
                setPomodoroPhase("longBreak");
                setSeconds(pomodoroLongBreakMinutes * 60);
                return;
            }

            setPomodoroPhase("break");
            setSeconds(pomodoroBreakMinutes * 60);
            return;
        }

        if (pomodoroPhase === "break") {
            setPomodoroPhase("focus");
            setSeconds(pomodoroFocusMinutes * 60);
            return;
        }

        if (pomodoroPhase === "longBreak") {
            setPomodoroSession(0);
            setPomodoroPhase("focus");
            setSeconds(pomodoroFocusMinutes * 60);
        }
    }, [
        seconds,
        isRunning,
        mode,
        pomodoroPhase,
        pomodoroSession,
        pomodoroFocusMinutes,
        pomodoroBreakMinutes,
        pomodoroLongBreakMinutes
    ]);

    

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;

    const changeMode = (newMode: TimerMode) => {
        setIsRunning(false);
        setMode(newMode);
        setPomodoroSession(0);
        setPomodoroPhase("focus");

        if (newMode === "focus") {
            setSeconds(focusMinutes * 60);
        } else {
            setSeconds(pomodoroFocusMinutes * 60);
        }
    };

    const toggleTimer = () => {
        if (seconds === 0) {
            setSeconds(getCurrentDuration());
        }

        setIsRunning((current) => !current);
    };

    const resetTimer = () => {
        setIsRunning(false);

        if (mode === "focus") {
            setSeconds(focusMinutes * 60);
        } else {
            setPomodoroSession(0);
            setPomodoroPhase("focus");
            setSeconds(pomodoroFocusMinutes * 60);
        }
    };

    const changeFocusDuration = (value: number) => {
        const newDuration = Math.max(10, value || 10);

        setFocusMinutes(newDuration);

        if (mode === "focus") {
            setSeconds(newDuration * 60);
            setIsRunning(false);
        }
    };

    const changePomodoroFocusDuration = (value: number) => {
        const newDuration = Math.max(1, value || 1);

        setPomodoroFocusMinutes(newDuration);

        if (mode === "pomodoro" && pomodoroPhase === "focus") {
            setSeconds(newDuration * 60);
            setIsRunning(false);
        }
    };

    const changePomodoroBreakDuration = (value: number, isLong: boolean) => {
        const newDuration = Math.max(1, value || 1);

        if (isLong) {
            setPomodoroLongBreakMinutes(newDuration);

            if (mode === "pomodoro" && pomodoroPhase === "longBreak") {
                setSeconds(newDuration * 60);
                setIsRunning(false);
            }

            return;
        }

        setPomodoroBreakMinutes(newDuration);

        if (mode === "pomodoro" && pomodoroPhase === "break") {
            setSeconds(newDuration * 60);
            setIsRunning(false);
        }
    };

    return (
        <main className="study-app">
            <div className="desk-lamp-glow" />

            <section className="timer-card">
                <div className="lamp">
                    <div className="lamp-light" />
                </div>

                <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={(_, newMode) => {
                        if (newMode !== null) {
                            changeMode(newMode);
                        }
                    }}
                    className="timer-switch"
                >
                    <ToggleButton value="focus">
                        Concentration
                    </ToggleButton>

                    <ToggleButton value="pomodoro">
                        Pomodoro
                    </ToggleButton>
                </ToggleButtonGroup>

                <p className="eyebrow">
                    {mode === "focus"
                        ? "SESSION DE CONCENTRATION"
                        : pomodoroPhase === "focus"
                            ? `POMODORO · CONCENTRATION · ${pomodoroSession + 1}/4`
                            : pomodoroPhase === "break"
                                ? "POMODORO · PAUSE"
                                : "POMODORO · LONGUE PAUSE"}
                </p>

                <div className={`timer ${isRunning ? "timer-running" : ""}`}>
                    {formattedTime}
                </div>

                <p className="timer-message">
                    {!isRunning && seconds === 0
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
                            : seconds === getCurrentDuration()
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

                {mode === "focus" && (
                    <div className="duration">
                        <span>Durée</span>

                        <div className="duration-control">
                            <button
                                onClick={() =>
                                    changeFocusDuration(focusMinutes - 5)
                                }
                            >
                                −
                            </button>

                            <span>{focusMinutes} min</span>

                            <button
                                onClick={() =>
                                    changeFocusDuration(focusMinutes + 5)
                                }
                            >
                                +
                            </button>
                        </div>
                    </div>
                )}

                {mode === "pomodoro" && (
                    <div className="pomodoro-settings">
                        <div className="duration">
                            <span>Concentration</span>

                            <div className="duration-control">
                                <button
                                    onClick={() =>
                                        changePomodoroFocusDuration(
                                            pomodoroFocusMinutes - 5
                                        )
                                    }
                                >
                                    −
                                </button>

                                <span>
                                    {pomodoroFocusMinutes} min
                                </span>

                                <button
                                    onClick={() =>
                                        changePomodoroFocusDuration(
                                            pomodoroFocusMinutes + 5
                                        )
                                    }
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="duration">
                            <span>Pause</span>

                            <div className="duration-control">
                                <button
                                    onClick={() =>
                                        changePomodoroBreakDuration(
                                            pomodoroBreakMinutes - 1,
                                            false
                                        )
                                    }
                                >
                                    −
                                </button>

                                <span>
                                    {pomodoroBreakMinutes} min
                                </span>

                                <button
                                    onClick={() =>
                                        changePomodoroBreakDuration(
                                            pomodoroBreakMinutes + 1,
                                            false
                                        )
                                    }
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="duration">
                            <span>Longue pause</span>

                            <div className="duration-control">
                                <button
                                    onClick={() =>
                                        changePomodoroBreakDuration(
                                            pomodoroLongBreakMinutes - 1,
                                            true
                                        )
                                    }
                                >
                                    −
                                </button>

                                <span>
                                    {pomodoroLongBreakMinutes} min
                                </span>

                                <button
                                    onClick={() =>
                                        changePomodoroBreakDuration(
                                            pomodoroLongBreakMinutes + 1,
                                            true
                                        )
                                    }
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <section className="tasks-card">
                <TodoList />
            </section>
        </main>
    );
}

export default Timer;

