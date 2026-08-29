import { useEffect, useState } from "react";


function Timer(){
    const  TEMPS_INITIALE = 0.1 * 60; //en secondes (25 minutes)
    const [seconds, setSeconds] = useState(TEMPS_INITIALE);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() =>{
        if(!isRunning) return;

        const interval = setInterval(() => { //setInterval permet de réaliser une action à chaque intervale de x ms, ici 1000
            setSeconds((current) => {
                if(current <= 1){
                setIsRunning(false);
                    return 0;
            }else {
                    return current-1;

            }
        });
        }, 1000);

        return () => clearInterval(interval); //il faut arrêter l'interval crée
    }, [isRunning]);

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedTime = `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;

    //démarrer/pause/reprendre
    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    
    const resetTimer = () => {
        setIsRunning(false);
        setSeconds(TEMPS_INITIALE);
    };

    return(
    <>
        <div>
            <h1>{formattedTime}</h1>

            <button onClick={toggleTimer}>
                {isRunning ? "Pause" : seconds === TEMPS_INITIALE ? "Démarrer" : "Reprendre"}
            </button>

            <button onClick={resetTimer}>
                Réinitialiser
            </button>
        </div>
    </>
    );
}

export default Timer;