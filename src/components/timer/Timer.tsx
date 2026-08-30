import { useEffect, useState } from "react";
import TodoList from "./todoList";


function Timer(){
    const [focusMinutes, setFocusMinutes] = useState(25);
    const [seconds, setSeconds] = useState(focusMinutes * 60);
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
        setSeconds(focusMinutes * 60);
    };

    const changeFocusDuration = (minutes: number) => {
        if(minutes < 10){
            minutes = 10;
        }
        setFocusMinutes(minutes);
        setSeconds(minutes * 60);
        setIsRunning(false);
    }

    return(
    <>
        <div>
            <h1>{formattedTime}</h1>

            <button onClick={toggleTimer}>
                {isRunning ? "Pause" : seconds === focusMinutes * 60 ? "Démarrer" : "Reprendre"}
            </button>

            <button onClick={resetTimer}>
                Réinitialiser
            </button>
        </div>
        <div>
        <label>
          Durée de concentration :
          <input
            type="number"
            min="10"
            step={5}
            value={focusMinutes}
            onChange={(e) =>
              changeFocusDuration(Number(e.target.value))
            }
          />
          minutes
        </label>
        <TodoList/>
      </div>
    </>
    );
}

export default Timer;