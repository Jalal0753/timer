import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Category, Session } from "../../types";
import { getSessions } from "../../services/session_service";
import { getCategories } from "../../services/category_service";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import "./Statistics.css";

type PeriodPreset = "7" | "30" | "90" | "custom";

function formatDuration(seconds: number) {
    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
        return `${hours}h ${String(minutes).padStart(2, "0")}min`;
    }

    return `${minutes} min`;
}

function formatShortDuration(seconds: number) {
    const minutes = Math.floor(seconds / 60);

    if (minutes >= 60) {
        return `${Math.floor(minutes / 60)}h`;
    }

    return `${minutes}m`;
}

function getDateInputValue(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getStartDate(preset: PeriodPreset) {
    const date = new Date();

    if (preset === "7") {
        date.setDate(date.getDate() - 6);
    } else if (preset === "30") {
        date.setDate(date.getDate() - 29);
    } else if (preset === "90") {
        date.setDate(date.getDate() - 89);
    }

    return getDateInputValue(date);
}

function Statistics() {
    const navigate = useNavigate();

    const [sessions, setSessions] = useState<Session[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [period, setPeriod] = useState<PeriodPreset>("7");

    const [startDate, setStartDate] = useState(
        getStartDate("7")
    );

    const [endDate, setEndDate] = useState(
        getDateInputValue(new Date())
    );

    useEffect(() => {
        Promise.all([
            getSessions(),
            getCategories(),
        ]).then(([sessionsData, categoriesData]) => {
            setSessions(sessionsData);
            setCategories(categoriesData);
        });
    }, []);

    const categoryMap = useMemo(() => {
        return new Map(
            categories.map((category) => [
                category.id,
                category,
            ])
        );
    }, [categories]);

    const filteredSessions = useMemo(() => {
        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T23:59:59`);

        return sessions
            .filter((session) => {
                const date = new Date(session.started_at);

                return date >= start && date <= end;
            })
            .sort(
                (a, b) =>
                    new Date(b.started_at).getTime() -
                    new Date(a.started_at).getTime()
            );
    }, [sessions, startDate, endDate]);

    const totalDuration = useMemo(() => {
        return filteredSessions.reduce(
            (total, session) => total + session.duration,
            0
        );
    }, [filteredSessions]);

    const averageDuration =
        filteredSessions.length > 0
            ? totalDuration / filteredSessions.length
            : 0;

    const personalRecord = useMemo(() => {
        return filteredSessions.reduce(
            (max, session) =>
                Math.max(max, session.duration),
            0
        );
    }, [filteredSessions]);

    const dailyData = useMemo(() => {
        const days = new Map<
            string,
            { label: string; duration: number }
        >();

        const start = new Date(`${startDate}T00:00:00`);
        const end = new Date(`${endDate}T00:00:00`);

        for (
            const date = new Date(start);
            date <= end;
            date.setDate(date.getDate() + 1)
        ) {
            const key = getDateInputValue(date);

            days.set(key, {
                label: date.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "short",
                }),
                duration: 0,
            });
        }

        filteredSessions.forEach((session) => {
            const date = new Date(session.started_at);
            const key = getDateInputValue(date);

            const day = days.get(key);

            if (day) {
                day.duration += session.duration;
            }
        });

        return Array.from(days.values()).map((day) => ({
            ...day,
            minutes: Math.round(day.duration / 60),
        }));
    }, [filteredSessions, startDate, endDate]);

    const categoryData = useMemo(() => {
        const totals = new Map<
            number | null,
            number
        >();

        filteredSessions.forEach((session) => {
            totals.set(
                session.category_id,
                (totals.get(session.category_id) ?? 0) +
                    session.duration
            );
        });

        return Array.from(totals.entries())
            .map(([categoryId, duration]) => {
                const category =
                    categoryId === null
                        ? null
                        : categoryMap.get(categoryId);

                return {
                    id: categoryId,
                    name: category?.name ?? "Sans catégorie",
                    color: category?.color ?? "#8D795E",
                    duration,
                    minutes: Math.round(duration / 60),
                };
            })
            .sort((a, b) => b.duration - a.duration);
    }, [filteredSessions, categoryMap]);

    const handlePeriodChange = (
        newPeriod: PeriodPreset
    ) => {
        setPeriod(newPeriod);

        if (newPeriod !== "custom") {
            setStartDate(getStartDate(newPeriod));
            setEndDate(getDateInputValue(new Date()));
        }
    };

    const bestSessions = useMemo(() => {
        return [...filteredSessions]
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 5);
    }, [filteredSessions]);

    return (
        <main className="stats-page">
            <div className="stats-glow" />

            <header className="stats-header">
                <button
                    className="back-button"
                    onClick={() => navigate(-1)}
                    aria-label="Retour"
                >
                    ×
                </button>

                <div>
                    <p className="eyebrow">
                        VOTRE PRODUCTIVITÉ
                    </p>

                    <h1>Statistiques</h1>

                    <p className="stats-subtitle">
                        Comprenez votre rythme de travail
                        et suivez vos progrès.
                    </p>
                </div>
            </header>

            {/* PÉRIODE */}
            <section className="stats-card period-card">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">
                            ANALYSE
                        </p>

                        <h2>Période</h2>
                    </div>
                </div>

                <div className="period-switch">
                    {(
                        [
                            ["7", "7 jours"],
                            ["30", "30 jours"],
                            ["90", "90 jours"],
                            ["custom", "Personnalisée"],
                        ] as [PeriodPreset, string][]
                    ).map(([value, label]) => (
                        <button
                            key={value}
                            className={
                                period === value
                                    ? "period-button active"
                                    : "period-button"
                            }
                            onClick={() =>
                                handlePeriodChange(value)
                            }
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {period === "custom" && (
                    <div className="date-fields">
                        <div className="date-field">
                            <label htmlFor="start-date">
                                Du
                            </label>

                            <input
                                id="start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) =>
                                    setStartDate(
                                        e.target.value
                                    )
                                }
                            />
                        </div>

                        <span className="date-separator">
                            →
                        </span>

                        <div className="date-field">
                            <label htmlFor="end-date">
                                Au
                            </label>

                            <input
                                id="end-date"
                                type="date"
                                value={endDate}
                                onChange={(e) =>
                                    setEndDate(
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                    </div>
                )}
            </section>

            {/* KPIs */}
            <section className="stats-grid">
                <div className="stat-card stat-card-main">
                    <span className="stat-label">
                        TEMPS TOTAL
                    </span>

                    <strong>
                        {formatDuration(totalDuration)}
                    </strong>

                    <span className="stat-description">
                        de concentration
                    </span>
                </div>

                <div className="stat-card">
                    <span className="stat-label">
                        MOYENNE
                    </span>

                    <strong>
                        {formatDuration(
                            Math.round(averageDuration)
                        )}
                    </strong>

                    <span className="stat-description">
                        par session
                    </span>
                </div>

                <div className="stat-card">
                    <span className="stat-label">
                        PR
                    </span>

                    <strong>
                        {formatDuration(personalRecord)}
                    </strong>

                    <span className="stat-description">
                        meilleure session
                    </span>
                </div>

                <div className="stat-card">
                    <span className="stat-label">
                        SESSIONS
                    </span>

                    <strong>
                        {filteredSessions.length}
                    </strong>

                    <span className="stat-description">
                        sessions terminées
                    </span>
                </div>
            </section>

            {/* ACTIVITÉ */}
            <section className="stats-card chart-card">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">
                            ACTIVITÉ
                        </p>

                        <h2>Temps de concentration</h2>
                    </div>

                    <span className="chart-unit">
                        minutes
                    </span>
                </div>

                {dailyData.length > 0 ? (
                    <div className="chart-wrapper">
                        <ResponsiveContainer
                            width="100%"
                            height={280}
                        >
                            <BarChart
                                data={dailyData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: -20,
                                    bottom: 0,
                                }}
                            >
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: "#777166",
                                        fontSize: 10,
                                    }}
                                />

                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: "#625e57",
                                        fontSize: 10,
                                    }}
                                />

                                <Tooltip
                                    cursor={{
                                        fill: "rgba(255,255,255,0.025)",
                                    }}
                                    contentStyle={{
                                        border:
                                            "1px solid rgba(255,255,255,0.07)",
                                        borderRadius: "10px",
                                        background:
                                            "#24221f",
                                        color: "#ddd3c4",
                                        fontSize: "12px",
                                    }}
                                    formatter={(value) => [
                                        `${value} min`,
                                        "Concentration",
                                    ]}
                                />

                                <Bar
                                    dataKey="minutes"
                                    radius={[
                                        5,
                                        5,
                                        2,
                                        2,
                                    ]}
                                    fill="#c8a06b"
                                    maxBarSize={38}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <EmptyStats />
                )}
            </section>

            {/* CATÉGORIES */}
            <section className="stats-two-columns">
                <div className="stats-card category-card">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">
                                RÉPARTITION
                            </p>

                            <h2>Par catégorie</h2>
                        </div>
                    </div>

                    {categoryData.length > 0 ? (
                        <>
                            <div className="pie-wrapper">
                                <ResponsiveContainer
                                    width="100%"
                                    height={230}
                                >
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            dataKey="duration"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={65}
                                            outerRadius={90}
                                            paddingAngle={3}
                                            stroke="none"
                                        >
                                            {categoryData.map(
                                                (category) => (
                                                    <Cell
                                                        key={
                                                            category.id ??
                                                            "none"
                                                        }
                                                        fill={
                                                            category.color
                                                        }
                                                    />
                                                )
                                            )}
                                        </Pie>

                                        <Tooltip
                                            formatter={(
                                                value
                                            ) => [
                                                formatDuration(
                                                    Number(
                                                        value
                                                    )
                                                ),
                                                "Temps",
                                            ]}
                                            contentStyle={{
                                                border:
                                                    "1px solid rgba(255,255,255,0.07)",
                                                borderRadius:
                                                    "10px",
                                                background:
                                                    "#24221f",
                                                color: "#ddd3c4",
                                                fontSize:
                                                    "12px",
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>

                                <div className="pie-center">
                                    <strong>
                                        {formatShortDuration(
                                            totalDuration
                                        )}
                                    </strong>

                                    <span>total</span>
                                </div>
                            </div>

                            <div className="category-legend">
                                {categoryData.map(
                                    (category) => (
                                        <div
                                            className="legend-row"
                                            key={
                                                category.id ??
                                                "none"
                                            }
                                        >
                                            <div className="legend-name">
                                                <span
                                                    className="category-dot"
                                                    style={{
                                                        backgroundColor:
                                                            category.color,
                                                    }}
                                                />

                                                {
                                                    category.name
                                                }
                                            </div>

                                            <span>
                                                {
                                                    category.minutes
                                                }{" "}
                                                min
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        </>
                    ) : (
                        <EmptyStats />
                    )}
                </div>

                {/* CLASSEMENT */}
                <div className="stats-card ranking-card">
                    <div className="section-heading">
                        <div>
                            <p className="eyebrow">
                                CLASSEMENT
                            </p>

                            <h2>Vos catégories</h2>
                        </div>
                    </div>

                    {categoryData.length > 0 ? (
                        <div className="ranking-list">
                            {categoryData.map(
                                (category, index) => {
                                    const percentage =
                                        totalDuration > 0
                                            ? (category.duration /
                                                  totalDuration) *
                                              100
                                            : 0;

                                    return (
                                        <div
                                            className="ranking-item"
                                            key={
                                                category.id ??
                                                "none"
                                            }
                                        >
                                            <div className="ranking-top">
                                                <div className="ranking-title">
                                                    <span className="ranking-position">
                                                        {String(
                                                            index +
                                                                1
                                                        ).padStart(
                                                            2,
                                                            "0"
                                                        )}
                                                    </span>

                                                    <span
                                                        className="category-dot"
                                                        style={{
                                                            backgroundColor:
                                                                category.color,
                                                        }}
                                                    />

                                                    <span>
                                                        {
                                                            category.name
                                                        }
                                                    </span>
                                                </div>

                                                <span className="ranking-value">
                                                    {formatDuration(
                                                        category.duration
                                                    )}
                                                </span>
                                            </div>

                                            <div className="progress-track">
                                                <div
                                                    className="progress-bar"
                                                    style={{
                                                        width: `${percentage}%`,
                                                        backgroundColor:
                                                            category.color,
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    ) : (
                        <EmptyStats />
                    )}
                </div>
            </section>

            {/* MEILLEURES SESSIONS */}
            <section className="stats-card best-sessions-card">
                <div className="section-heading">
                    <div>
                        <p className="eyebrow">
                            RECORDS
                        </p>

                        <h2>Meilleures sessions</h2>
                    </div>
                </div>

                {bestSessions.length > 0 ? (
                    <div className="sessions-list">
                        {bestSessions.map(
                            (session, index) => {
                                const category =
                                    session.category_id ===
                                    null
                                        ? null
                                        : categoryMap.get(
                                              session.category_id
                                          );

                                return (
                                    <div
                                        className="best-session"
                                        key={session.id}
                                    >
                                        <span className="session-rank">
                                            {index + 1}
                                        </span>

                                        <div className="session-info">
                                            <strong>
                                                {formatDuration(
                                                    session.duration
                                                )}
                                            </strong>

                                            <span>
                                                {category?.name ??
                                                    "Sans catégorie"}{" "}
                                                ·{" "}
                                                {new Date(
                                                    session.started_at
                                                ).toLocaleDateString(
                                                    "fr-FR",
                                                    {
                                                        day: "numeric",
                                                        month: "short",
                                                    }
                                                )}
                                            </span>
                                        </div>

                                        <span
                                            className="category-dot"
                                            style={{
                                                backgroundColor:
                                                    category
                                                        ?.color ??
                                                    "#8D795E",
                                            }}
                                        />
                                    </div>
                                );
                            }
                        )}
                    </div>
                ) : (
                    <EmptyStats />
                )}
            </section>
        </main>
    );
}

function EmptyStats() {
    return (
        <div className="empty-stats">
            <span>○</span>
            <p>Aucune session sur cette période.</p>
        </div>
    );
}

export default Statistics;