import {useWebSocketContext} from "./WebSocketContext.tsx";
import {useNavigate} from "react-router-dom";

function Home (){

    const {sendJsonMessage, messages, gamestate} = useWebSocketContext();

    const navigate = useNavigate();

    function startGame(){
        sendJsonMessage({
            type: "init_game"
        })
    }
    if(messages.current !== undefined){
        gamestate.current = true;
        if(messages.current.type == "init_game"){
            navigate('/game')
        }
    }


    return(
        <button onClick={startGame}>START GAME</button>
    )
}

export default Home;