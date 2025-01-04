import {useWebSocketContext} from "./WebSocketContext.tsx";
import {useNavigate} from "react-router-dom";
import "./Home.css"
import {useState} from "react";
import resources from "./consts.ts";

function Home (){

    const {sendJsonMessage, messages, gamestate} = useWebSocketContext();
    const[loading, setLoading] = useState(false);
    const {sounds} = resources;

    const navigate = useNavigate();

    function startGame(){
        setLoading(true);
        sendJsonMessage({
            type: "init_game"
        })
    }

    function chessbot(){
        sendJsonMessage({
            type: "chessbot"
        })
    }

    if(messages.current !== undefined){
        gamestate.current = true;
        if(messages.current.type == "init_game"){
            sounds("NOTIFY", false)
            navigate('/game')
        }
    }

    function reload(){
        setLoading(false)
        sendJsonMessage({
            type: "cancel"
        })
        navigate("/")
    }


    return (
        <>
            {!loading && <div className="home-container">
                <header className="home-header">
                    <h1>Ultimate Chess</h1>
                    <p>Play chess with friends, AI, or opponents worldwide!</p>
                </header>
                <main className="home-main">
                    <div className="home-options">
                        <button onClick={startGame} className="home-button play-online">Play Online</button>
                        <button className="home-button play-ai" onClick={chessbot}>Play Against AI</button>
                    </div>
                </main>
                <footer className="home-footer">
                    <p>
                        <a href="https://www.chess.com/learn-how-to-play-chess" target="_blank">About</a> |
                        <a href="/rules">Rules</a> |
                        <a href="/settings">Settings</a>
                    </p>
                </footer>
            </div>}
            {loading &&
                <div className="loading-screen">
                    <div className="loading-content">
                        <p>Waiting for players...</p>
                        <div className="spinner"></div>
                        <button className="cancel-button" onClick={reload}>Cancel</button>
                    </div>
                </div>

            }
            </>
    )
}

export default Home;