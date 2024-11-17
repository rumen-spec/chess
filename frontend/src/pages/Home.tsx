import {useWebSocketContext} from "./WebSocketContext.tsx";
import {useNavigate} from "react-router-dom";
import "./Home.css"

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


    return (
            <div className="home-container">
                <div className="home-background"></div>
                <header className="home-header">
                    <h1>Ultimate Chess</h1>
                    <p>Play chess with friends, AI, or opponents worldwide!</p>
                </header>
                <main className="home-main">
                    <div className="home-options">
                        <button onClick={startGame} className="home-button play-online">Play Online</button>
                        <button className="home-button play-ai">Play Against AI</button>
                    </div>
                    <div className="home-leaderboard">
                        <button className="leaderboard-button">View Leaderboard</button>
                    </div>
                </main>
                <footer className="home-footer">
                    <p>
                        <a href="/about">About</a> |
                        <a href="/rules">Rules</a> |
                        <a href="/settings">Settings</a>
                    </p>
                </footer>
            </div>
    )
}

export default Home;