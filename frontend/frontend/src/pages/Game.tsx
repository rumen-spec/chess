import useWebSocket from "react-use-websocket";
import './Game.css';
import Chessboard from "./Chessboard.tsx";
import {useState} from "react";

function Game() {
    const socketUrl = 'ws://localhost:8080';
    const [message, setMessage] = useState('');
    const [gameState, setGameState] = useState(false)
    const {
        sendMessage,
        sendJsonMessage,
        readyState,
        getWebSocket,
    } = useWebSocket(socketUrl, {
        onOpen: () => console.log('WebSocket opened'),
        onClose: () => setGameState(false),
        onMessage: msg => eventHandler(msg.data),
        shouldReconnect: (closeEvent) => true,
    });

    function startgame(){
        sendJsonMessage({
            "type": "init_game",
        })
    }

    if(gameState){
        document.getElementById('chessboard').style.pointerEvents = 'all';
    }
    function eventHandler(m) {
        const message = JSON.parse(m)
        console.log(message)

        if (message.type === "init_game") {
            setGameState(true);
            if (message.payload.color == 'black') {
                const Chessboard = document.getElementById('chessboard')
                Chessboard.style.transform = 'rotateX(180deg)'
                for(let i = 0; i < Chessboard.children.length; i++) {
                    Chessboard.children.item(i).style.transform = 'rotateX(180deg)'
                }
            }


        }
        if(message.type === "init_game") {}

    }


    return (
        <div className="game-container">
            <div className="chessboard-container">
                <Chessboard sendJsonMessage={sendJsonMessage} />
            </div>
            {!gameState && <div className="controls-container">
                <h1 className="game-title">Play Chess</h1>
                <div className="button-container">
                    <button onClick={startgame} className="text">Play Online</button>
                    <button className="text">Play vs Bot</button>
                </div>
            </div>}
        </div>
    )
}

export default Game;