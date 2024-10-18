import useWebSocket from "react-use-websocket";
import './Game.css';
import Chessboard from "./Chessboard.tsx";
import {useEffect, useRef, useState} from "react";
import {i, s} from "vite/dist/node/types.d-aGj9QkWt";

function Game() {
    const activeTile = useRef<HTMLElement | ''>('');
    const previousTile = useRef<HTMLElement | ''>('');
    const previousmoves = useRef<string[]>([]);
    const turn = useRef<boolean>(false);
    let moves = [];
    const socketUrl = 'ws://localhost:8080';
    const [gameState, setGameState] = useState(false)
    const {
        sendJsonMessage,
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
        console.log(message);

        if (message.type === "init_game") {
            setGameState(true);
            turn.current = true;
            if (message.payload.color == 'black') {
                const Chessboard = document.getElementById('chessboard')
                turn.current = false;
                Chessboard.style.transform = 'rotateX(180deg)'
                for(let i = 0; i < Chessboard.children.length; i++) {
                    Chessboard.children.item(i).style.transform = 'rotateX(180deg)'
                }
            }


        }

        if(message.type === "available_moves") {
            console.log(message);
            moves = message.payload;
            for(let i = 0; i < moves.length; i++) {
                if(moves[i].length !== 2 && moves[i][1] != 'x'){
                    moves[i] = moves[i][1] + moves[i][2]
                }else if(moves[i][1] == 'x'){
                    moves[i] = moves[i][2] + moves[i][3]
                }
                console.log(moves[i])
            }
            handlePossibleMoves(moves);
            previousmoves.current = moves;
        }

        if(message.type === "move") {
            const startingtile = document.getElementById(message.payload.from);
            const endingtile = document.getElementById(message.payload.to);
            turn.current = true;
            const piece = startingtile.firstChild
            startingtile.removeChild(piece);
            piece.id = endingtile.id;
            if(endingtile.firstChild != null){
                endingtile.removeChild(endingtile.firstChild);
            }
            endingtile.appendChild(piece);
            activeTile.current = piece;
            activeTile.current.style.backgroundColor = 'rgb(173,193,58)';
        }

    }

    function handlePossibleMoves(moves: []){
        console.log(moves);
        console.log(previousTile.current.id, activeTile.current.id)
        for (let i = 0; i < moves.length; i++) {
            const tile = document.getElementById(moves[i]);
            if(tile.firstChild != null){
                console.log('kill')
                tile.style.backgroundImage = `url("../../images/dot_piece.png")`
            }
            else{
                tile.style.backgroundImage = `url("../../images/dot.png")`
            }
        }
        if(activeTile.current == previousTile.current && activeTile.current != ''){
            activeTile.current.style.border = 'none';
            activeTile.current.style.removeProperty("background-color");

            for(let i = 0; i<moves.length; i++){
                const tile = document.getElementById(moves[i]);
                tile.style.removeProperty("background-image");
            }
            activeTile.current = '';
        }
        if(activeTile.current.id != previousTile.current.id && !previousmoves.current.includes(activeTile.current.id) && previousTile.current != ''){
            for(let i = 0; i<previousmoves.current.length; i++){
                const tile = document.getElementById(previousmoves.current[i]);
                tile.style.removeProperty("background-image");
            }
            previousTile.current.style.removeProperty("background-color");
            previousTile.current.style.border = 'none';
        }

        if(previousmoves.current.includes(activeTile.current.id) && turn.current){
            // const tile = document.getElementById(activeTile);

            for(let i = 0; i<previousmoves.current.length; i++){
                const tile = document.getElementById(previousmoves.current[i]);
                console.log(tile);
                tile.style.removeProperty("background-image");
            }
            const previous = document.getElementById(previousTile.current.id);
            const active = document.getElementById(activeTile.current.id)
            const piece = previous.firstChild;
            previous.removeChild(previous.firstChild)

            if(active.firstChild != null){
                active.removeChild(active.firstChild)
            }
            active.appendChild(piece);
            piece.id = active.id;


            sendJsonMessage({
                type: "move",
                move: {from: previous.id, to: active.id}
            })
            turn.current = false;
        }
    }


    useEffect(() => {
        const chessboardElement = document.getElementById('chessboard')

        if (chessboardElement) {
            chessboardElement.addEventListener('mousedown', handleMouseDown);

            return () => {
                chessboardElement.removeEventListener('mousedown', handleMouseDown);
            };
        }
    }, []);

    function handleMouseDown(e) {
        const element = e.target as HTMLElement;
        if (element.classList.contains('chess-piece')) {
            element.style.border = '3px solid white';
            element.style.backgroundColor = 'rgb(173,193,58)';
        }

            previousTile.current = activeTile.current;

            activeTile.current = element;

            if(turn.current){
                sendJsonMessage({
                type: "available_moves",
                position: element.id,
        });
        }
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