import useWebSocket from "react-use-websocket";
import {redirect} from "react-router-dom";
import Chessboard from "./Chessboard.tsx";
import {useState} from "react";

function Game() {
    const socketUrl = 'ws://localhost:8080';
    const [message, setMessage] = useState('');
    const {
        sendMessage,
        sendJsonMessage,
        readyState,
        getWebSocket,
    } = useWebSocket(socketUrl, {
        onOpen: () => console.log('WebSocket opened'),
        onMessage: msg => eventHandler(msg.data),
        shouldReconnect: (closeEvent) => true,
    });

    function startgame(){
        sendJsonMessage({
            "type": "init_game",
        })
        // console.log(message);

        // if(lastJsonMessage){
        //     console.log(lastJsonMessage)
        //     if(lastJsonMessage.payload.color == 'black'){
        //         const Chessboard = document.getElementById('chessboard')
        //         Chessboard.style.transform = 'rotateX(180deg)'
        //         for(let i = 0; i < Chessboard.children.length; i++) {
        //             Chessboard.children.item(i).style.transform = 'rotateX(180deg)'
        //         }
        //     }
        // }
    }

    function eventHandler(m) {
        const message = JSON.parse(m)
        if (message.type === "init_game") {
            if (message.payload.color == 'black') {
                const Chessboard = document.getElementById('chessboard')
                Chessboard.style.transform = 'rotateX(180deg)'
                for(let i = 0; i < Chessboard.children.length; i++) {
                    Chessboard.children.item(i).style.transform = 'rotateX(180deg)'
                }
            }
        }
    }

    return(
        <>
            <button onClick={startgame}>click to </button>
            <h1>{JSON.stringify(message)}</h1>
            <h1> {JSON.stringify(readyState)}</h1>
            <Chessboard/>
        </>
    )
}

export default Game;