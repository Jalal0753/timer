import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Session } from "../../types";
import { getSessions } from "../../services/session_service";

function Statistics() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        getSessions().then(setSessions);
    }, []);

    return (
        <>
            <button onClick={() => navigate(-1)}>
                X
            </button>

            <div>
                {sessions.map((session) => (
                    <div key={session.id}>
                        <span>{session.duration}</span>
                    </div>
                ))}
            </div>
        </>
    );
}

export default Statistics;