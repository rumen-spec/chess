import useWebSocket from "react-use-websocket";
import './Game.css';
import Chessboard from "./Chessboard.tsx";
import {useEffect, useRef, useState} from "react";

function Game() {

    // storing the tile that was just clicked and the previous one
    const activeTile = useRef<HTMLElement | ''>('');
    const previousTile = useRef<HTMLElement | ''>('');
    const king = useRef<string>('');

    // the moves list of the previous tile
    const previousmoves = useRef<string[]>([]);
    const turn = useRef<boolean>(false);
    const [white, setWhite] = useState<boolean>(true);
    let moves:string[] = [];
    const movelist = useRef<string[]>([]);



    const socketUrl = 'ws://localhost:8080';
    const [gameState, setGameState] = useState(false)

    // websocket
    const {
        sendJsonMessage,
    } = useWebSocket(socketUrl, {
        onOpen: () => console.log('WebSocket opened'),
        onClose:() => console.log('WebSocket closed') ,
        onMessage: msg => eventHandler(msg.data),
        shouldReconnect: (closeEvent) => true,
    });


    // send start to the webocket
    function startgame(){
        sendJsonMessage({
            "type": "init_game",
        })
    }

    // make the game available to user
    if(gameState){
        document.getElementById('chessboard').style.pointerEvents = 'all';
    }

    // handles any messages from the websocket
    function eventHandler(m) {
        const message = JSON.parse(m)
        console.log(message);

        // if another user joins game
        if (message.type === "init_game") {
            setGameState(true);
            turn.current = true;

            if (message.payload.color == 'black') {
                setWhite(false);
                const Chessboard = document.getElementById('chessboard')
                turn.current = false;
                Chessboard.style.transform = 'rotateX(180deg)'
                for(let i = 0; i < Chessboard.children.length; i++) {
                    Chessboard.children.item(i).style.transform = 'rotateX(180deg)'
                }
            }


        }

        if(message.type === "check") {
            if(white){
                for(let tile in document.getElementsByClassName('tile')){
                    const _tile = document.getElementsByClassName('tile').item(parseInt(tile)) as HTMLDivElement;
                    if(_tile.firstChild != null){
                        if(_tile.firstChild.style.backgroundImage == 'url("../../images/wK.png")') {
                            _tile.style.backgroundImage = 'url("../../images/check.png")';
                            king.current = _tile.id
                        }
                    }
                }
            }
            else{
                for(let tile in document.getElementsByClassName('tile')){
                    const _tile = document.getElementsByClassName('tile').item(parseInt(tile)) as HTMLDivElement;
                    if(_tile.firstChild != null){
                        if(_tile.firstChild.style.backgroundImage == 'url("../../images/bK.png")') {
                            _tile.style.backgroundImage = 'url("../../images/check.png")';
                            king.current = _tile.id
                        }
                    }
                }
            }
        }

        if(message.type === "available_moves") {
            moves = message.payload;
            for(let i = 0; i < moves.length; i++) {
                if(moves[i] == 'O-O' && white){
                    moves[i] = 'g1';
                }
                if(moves[i] == 'O-O' && !white){
                    moves[i] = 'g8';
                }
                if(moves[i] == 'O-O-O' && white){
                    moves[i] = 'c1';
                }
                if(moves[i] == 'O-O-O' && !white){
                    moves[i] = 'c8';
                }
                else if(moves[i].length !== 2 && moves[i][1] != 'x'){
                    moves[i] = moves[i][1] + moves[i][2]
                }else if(moves[i][1] == 'x'){
                    moves[i] = moves[i][2] + moves[i][3]
                }
            }
            handlePossibleMoves(moves);
            previousmoves.current = moves;
        }

        if(message.type === "move") {
            const startingtile = document.getElementById(message.payload.from);
            const endingtile = document.getElementById(message.payload.to);
            movelist.current.push(message.payload.from + '→' + message.payload.to);
            turn.current = true;
            moves.push(message.payload.from + '→' + message.payload.to);
            const piece = startingtile.firstChild
            startingtile.removeChild(piece);
            piece.id = endingtile.id;
            if(endingtile.firstChild != null){
                const captured = endingtile.firstChild;
                endingtile.removeChild(endingtile.firstChild);
            }
            endingtile.appendChild(piece);
            activeTile.current = piece;
            activeTile.current.style.backgroundColor = 'rgb(173,193,58)';
            if(message.payload.from == 'e1' && message.payload.to == 'g1'){
                const rooktile = document.getElementById('h1')

                if(rooktile && rooktile.firstChild) {
                    rooktile.firstChild.id = 'f1'
                    document.getElementById('f1').appendChild(rooktile.firstChild);
                }
            }
            if(message.payload.from == 'e1' && message.payload.to == 'c1'){
                const rooktile = document.getElementById('a1')

                if(rooktile && rooktile.firstChild) {
                    rooktile.firstChild.id = 'd1'
                    document.getElementById('d1').appendChild(rooktile.firstChild);
                }
            }
            if(message.payload.from == 'e8' && message.payload.to == 'g8'){
                const rooktile = document.getElementById('h8')

                if(rooktile && rooktile.firstChild) {
                    rooktile.firstChild.id = 'f8'
                    document.getElementById('f8').appendChild(rooktile.firstChild);
                }
            }
            if(message.payload.from == 'e8' && message.payload.to == 'c8'){
                const rooktile = document.getElementById('a8')

                if(rooktile && rooktile.firstChild) {
                    rooktile.firstChild.id = 'd8'
                    document.getElementById('d8').appendChild(rooktile.firstChild);
                }
            }
        }

    }


    function handlePossibleMoves(moves: []){
        for (let i = 0; i < moves.length; i++) {
            const tile = document.getElementById(moves[i]);
            if(tile.firstChild != null){
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
            for(let i = 0; i<previousmoves.current.length; i++){
                const tile = document.getElementById(previousmoves.current[i]);
                tile.style.removeProperty("background-image");
            }
            const previous = document.getElementById(previousTile.current.id);
            const active = document.getElementById(activeTile.current.id)
            const piece = previous.firstChild;
            if( activeTile.current.id == 'g1' && previousTile.current.id == 'e1'){
                const rooktile = document.getElementById('h1');
                rooktile.firstChild.id = 'f1';
                document.getElementById('f1').appendChild(rooktile.firstChild);
            }

            if( activeTile.current.id == 'c1' && previousTile.current.id == 'e1'){
                const rooktile = document.getElementById('a1');
                rooktile.firstChild.id = 'd1';
                document.getElementById('d1').appendChild(rooktile.firstChild);
            }

            if( activeTile.current.id == 'g8' && previousTile.current.id == 'e8'){
                const rooktile = document.getElementById('h8');
                rooktile.firstChild.id = 'f8';
                document.getElementById('f8').appendChild(rooktile.firstChild);
            }
            if( activeTile.current.id == 'c8' && previousTile.current.id == 'c8'){
                const rooktile = document.getElementById('a8');
                rooktile.firstChild.id = 'd8';
                document.getElementById('d8').appendChild(rooktile.firstChild);
            }

            previous.removeChild(previous.firstChild)

            if(active.firstChild != null){
                active.removeChild(active.firstChild)
            }
            active.appendChild(piece);
            piece.id = active.id;


            if(king.current != '') {
                const king_square = document.getElementById(king.current);
                king_square.style.removeProperty('background-image');
            }

            sendJsonMessage({
                type: "move",
                move: {from: previous.id, to: active.id}
            })

            movelist.current.push(previous.id + '→' + active.id);
            active.firstChild.style.removeProperty('background-color');
            active.firstChild.style.border = 'none';
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
        <div className="game-container" id="game-container">
            <div className="chessboard-container">
                {!white ? <div className="numbers">
                    <h1>1</h1>
                    <h1>2</h1>
                    <h1>3</h1>
                    <h1>4</h1>
                    <h1>5</h1>
                    <h1>6</h1>
                    <h1>7</h1>
                    <h1>8</h1>
                </div> : <div className="numbers">
                    <h1>8</h1>
                    <h1>7</h1>
                    <h1>6</h1>
                    <h1>5</h1>
                    <h1>4</h1>
                    <h1>3</h1>
                    <h1>2</h1>
                    <h1>1</h1>
                </div>}
                <div>
                    <div className="players"> Opponent</div>
                    <div className="captured-pieces"></div>

                    <Chessboard/>

                    <div className="letters">
                        <h1>a</h1>
                        <h1>b</h1>
                        <h1>c</h1>
                        <h1>d</h1>
                        <h1>e</h1>
                        <h1>f</h1>
                        <h1>g</h1>
                        <h1>h</h1>
                    </div>

                    <div> You </div>
                    <div className="captured-pieces"></div>
                </div>
                {/*<div className='moves'> <h1>{movelist.current}</h1></div>*/}
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