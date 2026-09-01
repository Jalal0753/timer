import { useNavigate } from "react-router-dom";

function Statistics(){
    const navigate = useNavigate();
    return(
        <>
        <button onClick={() => navigate(-1)}>
            X
        </button>
        </>
    );
}

export default Statistics;