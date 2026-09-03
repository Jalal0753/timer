import { useEffect, useState } from "react";
import TodoList from "./todoList";
import "./Timer.css";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import type { Category } from "../../types";
import { getCategories } from "../../services/category_service";
import { addSession } from "../../services/session_service";

type TimerMode = "focus" | "pomodoro";
type PomodoroPhase = "focus" | "break" | "longBreak";

function Timer() {
    const navigate = useNavigate();

    const [mode, setMode] = useState<TimerMode>("focus");
    const [focusMinutes, setFocusMinutes] = useState(25);

    const [pomodoroFocusMinutes, setPomodoroFocusMinutes] = useState(25);
    const [pomodoroBreakMinutes, setPomodoroBreakMinutes] = useState(5);
    const [pomodoroLongBreakMinutes, setPomodoroLongBreakMinutes] = useState(15);
    const [pomodoroPhase, setPomodoroPhase] =
        useState<PomodoroPhase>("focus");
    const [pomodoroSession, setPomodoroSession] = useState(0);

    const [seconds, setSeconds] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);

    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryId, setCategoryId] = useState<number | null>(null);

    // Temps restant au moment où le bloc de travail a commencé
    const [sessionStartSeconds, setSessionStartSeconds] =
        useState<number | null>(null);

    useEffect(() => {
        getCategories().then(setCategories);
    }, []);

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

    // Sauvegarde le bloc de travail actuel
    const saveCurrentSession = async () => {
        if (sessionStartSeconds === null) {
            return;
        }

        const duration = sessionStartSeconds - seconds;

        if (duration <= 0) {
            return;
        }

        await addSession(categoryId, duration);
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

    // Quand le timer arrive à 0
    useEffect(() => {
        if (!isRunning || seconds !== 0) {
            return;
        }

        const finishTimer = async () => {
            await saveCurrentSession();

            setSessionStartSeconds(null);
            setIsRunning(false);

            if (mode === "focus") {
                return;
            }

            // Pomodoro
            if (pomodoroPhase === "focus") {
                const newSession = pomodoroSession + 1;

                setPomodoroSession(newSession);

                if (newSession >= 4) {
                    setPomodoroPhase("longBreak");
                    setSeconds(pomodoroLongBreakMinutes * 60);
                    setIsRunning(true);
                    setSessionStartSeconds(
                        pomodoroLongBreakMinutes * 60
                    );
                    return;
                }

                setPomodoroPhase("break");
                setSeconds(pomodoroBreakMinutes * 60);
                setIsRunning(true);
                setSessionStartSeconds(pomodoroBreakMinutes * 60);
                return;
            }

            if (pomodoroPhase === "break") {
                setPomodoroPhase("focus");
                setSeconds(pomodoroFocusMinutes * 60);
                setIsRunning(true);
                setSessionStartSeconds(pomodoroFocusMinutes * 60);
                return;
            }

            if (pomodoroPhase === "longBreak") {
                setPomodoroSession(0);
                setPomodoroPhase("focus");
                setSeconds(pomodoroFocusMinutes * 60);
                setIsRunning(false);
                setSessionStartSeconds(null);
            }
        };

        finishTimer();
    }, [
        seconds,
        isRunning,
        mode,
        pomodoroPhase,
        pomodoroSession,
        pomodoroFocusMinutes,
        pomodoroBreakMinutes,
        pomodoroLongBreakMinutes,
    ]);

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
        remainingSeconds
    ).padStart(2, "0")}`;

    const changeMode = (newMode: TimerMode) => {
        setIsRunning(false);
        setSessionStartSeconds(null);

        setMode(newMode);
        setPomodoroSession(0);
        setPomodoroPhase("focus");

        if (newMode === "focus") {
            setSeconds(focusMinutes * 60);
        } else {
            setSeconds(pomodoroFocusMinutes * 60);
        }
    };

    const toggleTimer = async () => {
        // PAUSE
        if (isRunning) {
            await saveCurrentSession();

            setSessionStartSeconds(null);
            setIsRunning(false);

            return;
        }

        // COMMENCER / REPRENDRE
        if (seconds === 0) {
            const duration = getCurrentDuration();

            setSeconds(duration);
            setSessionStartSeconds(duration);
        } else {
            setSessionStartSeconds(seconds);
        }

        setIsRunning(true);
    };

    const resetTimer = async () => {
        // Si le timer tourne, on sauvegarde le temps travaillé
        if (isRunning) {
            await saveCurrentSession();
        }

        setIsRunning(false);
        setSessionStartSeconds(null);

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
            setSessionStartSeconds(null);
        }
    };

    const changePomodoroFocusDuration = (value: number) => {
        const newDuration = Math.max(1, value || 1);

        setPomodoroFocusMinutes(newDuration);

        if (mode === "pomodoro" && pomodoroPhase === "focus") {
            setSeconds(newDuration * 60);
            setIsRunning(false);
            setSessionStartSeconds(null);
        }
    };

    const changePomodoroBreakDuration = (
        value: number,
        isLong: boolean
    ) => {
        const newDuration = Math.max(1, value || 1);

        if (isLong) {
            setPomodoroLongBreakMinutes(newDuration);

            if (
                mode === "pomodoro" &&
                pomodoroPhase === "longBreak"
            ) {
                setSeconds(newDuration * 60);
                setIsRunning(false);
                setSessionStartSeconds(null);
            }

            return;
        }

        setPomodoroBreakMinutes(newDuration);

        if (
            mode === "pomodoro" &&
            pomodoroPhase === "break"
        ) {
            setSeconds(newDuration * 60);
            setIsRunning(false);
            setSessionStartSeconds(null);
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

                {/* CATÉGORIE */}
                <div className="category-selector">
                    <label htmlFor="category">
                        Catégorie
                    </label>

                    <select
                        id="category"
                        value={categoryId ?? ""}
                        onChange={(e) => {
                            const value = e.target.value;

                            setCategoryId(
                                value === "" ? null : Number(value)
                            );
                        }}
                        disabled={isRunning}
                    >
                        <option value="">
                            Sans catégorie
                        </option>

                        {categories.map((category) => (
                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>

                <p className="eyebrow">
                    {mode === "focus"
                        ? "SESSION DE CONCENTRATION"
                        : pomodoroPhase === "focus"
                            ? `POMODORO · CONCENTRATION · ${pomodoroSession + 1}/4`
                            : pomodoroPhase === "break"
                                ? "POMODORO · PAUSE"
                                : "POMODORO · LONGUE PAUSE"}
                </p>

                <div
                    className={`timer ${
                        isRunning ? "timer-running" : ""
                    }`}
                >
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
                                disabled={isRunning}
                                onClick={() =>
                                    changeFocusDuration(
                                        focusMinutes - 5
                                    )
                                }
                            >
                                −
                            </button>

                            <span>{focusMinutes} min</span>

                            <button
                                disabled={isRunning}
                                onClick={() =>
                                    changeFocusDuration(
                                        focusMinutes + 5
                                    )
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

            <nav
                className="floating-nav"
                aria-label="Navigation secondaire"
            >
                <button
                    className="floating-nav-button"
                    onClick={() => navigate("settings")}
                    aria-label="Paramètres"
                >
                    <SettingsOutlinedIcon />
                    <span>Paramètres</span>
                </button>

                <button
                    className="floating-nav-button"
                    onClick={() => navigate("stats")}
                    aria-label="Statistiques"
                >
                    <BarChartOutlinedIcon />
                    <span>Statistiques</span>
                </button>
            </nav>
        </main>
    );
}

export default Timer;
