import './Game.css';
import Chessboard from "./Chessboard.tsx";
import {useEffect, useRef, useState} from "react";
import {useWebSocketContext} from "./WebSocketContext.tsx";
import scores from "./consts.ts";
import {useNavigate} from "react-router-dom";


function Game() {


    const activeTile = useRef<HTMLElement | ''>('');
    const previousTile = useRef<HTMLElement | ''>('');
    const king = useRef<string>('');
    const previousmoves = useRef<string[]>([]);
    const [white, setWhite] = useState<boolean>(true);
    let moves: string[] = [];
    const movelist = useRef<string[]>([]);
    const {messages, sendJsonMessage,gamestate} = useWebSocketContext()
    const [UserCapturedPieces, SetUserCapturedPieces] = useState<string[]>([])
    const [OpponentCapturedPieces, SetOpponentCapturedPieces] = useState<string[]>([])
    const [user_score, setUser_score] = useState(0);
    const [opponent_score, setOpponent_score] = useState<number>(0)
    const [game_over, setGameOver] = useState<string>();
    const message = messages.current
    const nav = useNavigate();



    useEffect(() => {
        const chessboardElement = document.getElementById('chessboard')
        if (chessboardElement) {
            chessboardElement.addEventListener('mousedown', handleMouseDown);

            return () => {
                chessboardElement.removeEventListener('mousedown', handleMouseDown);
            };
        }
    }, []);

    function handleMouseDown(e:any) {
        const element = e.target as HTMLElement;
        if (element.classList.contains('chess-piece')) {
            element.style.border = '3px solid white';
            element.style.backgroundColor = 'rgb(173,193,58)';
        }

        previousTile.current = activeTile.current;

        activeTile.current = element;

            sendJsonMessage({
                type: "available_moves",
                position: element.id,
            });
    }

    useEffect(() => {
        console.log(message);
        if (message!==undefined){// if another user joins game
            if (message.type === "init_game") {

                if (message.payload.color == 'black') {
                    setWhite(false);
                    const Chessboard = document.getElementById('chessboard') as HTMLElement;
                    Chessboard.style.transform = 'rotateX(180deg)'
                    for (let i = 0; i < Chessboard.children.length; i++) {
                        // @ts-ignore
                        Chessboard.children.item(i).style.transform = 'rotateX(180deg)'
                    }
                }


            }

            if (message.type === "check") {
                if (white) {
                    for (let tile in document.getElementsByClassName('tile')) {
                        const _tile = document.getElementsByClassName('tile').item(parseInt(tile)) as HTMLDivElement;
                        if (_tile.firstChild != null) {
                            // @ts-ignore
                            if (_tile.firstChild.style.backgroundImage == 'url("../../images/wK.png")') {
                                _tile.style.backgroundImage = 'url("../../images/check.png")';
                                king.current = _tile.id
                            }
                        }
                    }
                } else {
                    for (let tile in document.getElementsByClassName('tile')) {
                        const _tile = document.getElementsByClassName('tile').item(parseInt(tile)) as HTMLDivElement;
                        if (_tile.firstChild != null) {
                            // @ts-ignore
                            if (_tile.firstChild.style.backgroundImage == 'url("../../images/bK.png")') {
                                _tile.style.backgroundImage = 'url("../../images/check.png")';
                                king.current = _tile.id
                            }
                        }
                    }
                }
            }

            if (message.type === "available_moves") {
                moves = message.payload;
                for (let i = 0; i < moves.length; i++) {
                    if (moves[i] == 'O-O' && white) {
                        moves[i] = 'g1';
                    }
                    if (moves[i] == 'O-O' && !white) {
                        moves[i] = 'g8';
                    }
                    if (moves[i] == 'O-O-O' && white) {
                        moves[i] = 'c1';
                    }
                    if (moves[i] == 'O-O-O' && !white) {
                        moves[i] = 'c8';
                    } else if (moves[i].length !== 2 && moves[i][1] != 'x') {
                        moves[i] = moves[i][1] + moves[i][2]
                    } else if (moves[i][1] == 'x') {
                        moves[i] = moves[i][2] + moves[i][3]
                    }
                }
                handlePossibleMoves(moves);
                previousmoves.current = moves;
            }

            if(message.type === "game_over"){
                if(white && message.payload.winner == "white"){
                    setGameOver(message.payload.how)
                    const chessboardElement = document.getElementById('chessboard') as HTMLElement;
                    chessboardElement.style.pointerEvents = "none";
                    sendJsonMessage({
                        type: "game_over"
                    });
                }else{
                    setGameOver(message.payload.how)
                    const chessboardElement = document.getElementById('chessboard') as HTMLElement;
                    chessboardElement.style.pointerEvents = "none";
                    sendJsonMessage({
                        type: "game_over"
                    });
                }
            }

            if(message.type === "disconnect"){
                if(!game_over) {
                    const chessboardElement = document.getElementById('chessboard') as HTMLElement;
                    chessboardElement.style.pointerEvents = "none";
                    setGameOver("Opponent disconnected");
                }
            }
            if(message.type === "en-passant"){
                const piece_id = message.move.to[0] + message.move.from[1];
                const square = document.getElementById(piece_id) as HTMLElement;
                const piece = square.firstChild as ChildNode;
                square.removeChild(piece);
            }

            if (message.type === "move") {
                const startingtile = document.getElementById(message.payload.from) as HTMLDivElement;
                const endingtile = document.getElementById(message.payload.to) as HTMLDivElement;

                movelist.current.push(message.payload.from + '→' + message.payload.to);

                const chessboard = document.getElementById('chessboard') as HTMLElement;
                chessboard.style.pointerEvents = "all";

                const piece = startingtile.firstChild as HTMLDivElement;
                startingtile.removeChild(piece);
                piece.id = endingtile.id;

                if (endingtile.firstChild != null) {
                    const pieces = document.getElementsByClassName('chess-piece');
                    for (let piecekey = 0; piecekey < pieces.length; piecekey++) {
                        // @ts-ignore
                        if (pieces[piecekey].id === endingtile.firstChild.id) {
                            const capturedPiece = pieces[piecekey] as HTMLDivElement;
                            SetOpponentCapturedPieces(prevState =>[...prevState,capturedPiece.style.backgroundImage[18] + capturedPiece.style.backgroundImage[19]])
                            const score = scores.get(capturedPiece.style.backgroundImage[19]);
                            if(score) setOpponent_score(prevState => prevState+score)
                        }
                    }
                    endingtile.removeChild(endingtile.firstChild);
                }
                endingtile.appendChild(piece);
                activeTile.current = piece;
                activeTile.current.style.backgroundColor = 'rgb(173,193,58)';


                if (message.payload.from == 'e1' && message.payload.to == 'g1') {
                    const rooktile = document.getElementById('h1') as HTMLDivElement;
                    const castleTile = document.getElementById('f1') as HTMLDivElement;
                    if (rooktile.firstChild) {
                        castleTile.appendChild(rooktile.firstChild)
                        // @ts-ignore
                        castleTile.firstChild.id = 'f1'
                    }
                } else if (message.payload.from == 'e1' && message.payload.to == 'c1') {
                    const rooktile = document.getElementById('a1') as HTMLDivElement;
                    const castleTile = document.getElementById('d1') as HTMLDivElement;
                    if (rooktile.firstChild) {
                        castleTile.appendChild(rooktile.firstChild)
                        // @ts-ignore
                        castleTile.firstChild.id = 'd1'
                    }
                } else if (message.payload.from == 'e8' && message.payload.to == 'g8') {
                    const rooktile = document.getElementById('h8') as HTMLDivElement;
                    const castleTile = document.getElementById('f8') as HTMLDivElement;
                    if (rooktile.firstChild) {
                        castleTile.appendChild(rooktile.firstChild)
                        // @ts-ignore
                        castleTile.firstChild.id = 'f8'
                    }
                } else if (message.payload.from == 'e8' && message.payload.to == 'c8') {
                    const rooktile = document.getElementById('a8') as HTMLDivElement;
                    const castleTile = document.getElementById('d8') as HTMLDivElement;
                    if (rooktile.firstChild) {
                        castleTile.appendChild(rooktile.firstChild)
                        // @ts-ignore
                        castleTile.firstChild.id = 'd8'
                    }
                }
            }

            // }


            function handlePossibleMoves(moves: string[]) {
                for (let i = 0; i < moves.length; i++) {
                    const tile = document.getElementById(moves[i]) as HTMLDivElement;
                    if (tile.firstChild != null) {
                        tile.style.backgroundImage = `url("../../images/dot_piece.png")`
                    } else {
                        tile.style.backgroundImage = `url("../../images/dot.png")`
                    }
                }

                if (activeTile.current == previousTile.current && activeTile.current != '') {
                    activeTile.current.style.border = 'none';
                    activeTile.current.style.removeProperty("background-color");

                    for (let i = 0; i < moves.length; i++) {
                        const tile = document.getElementById(moves[i]) as HTMLDivElement;
                        tile.style.removeProperty("background-image");
                    }
                    activeTile.current = '';
                }

                // @ts-ignore
                if (activeTile.current.id != previousTile.current.id && !previousmoves.current.includes(activeTile.current.id) && previousTile.current != '') {
                    for (let i = 0; i < previousmoves.current.length; i++) {
                        const tile = document.getElementById(previousmoves.current[i]) as HTMLDivElement;
                        if(!moves.includes(tile.id)) {
                            tile.style.removeProperty("background-image");
                        }
                    }
                    previousTile.current.style.removeProperty("background-color");
                    previousTile.current.style.border = 'none';
                }

                // @ts-ignore
                if (previousmoves.current.includes(activeTile.current.id)) {
                    for (let i = 0; i < previousmoves.current.length; i++) {
                        const tile = document.getElementById(previousmoves.current[i]);
                        // @ts-ignore
                        tile.style.removeProperty("background-image");
                    }
                    // @ts-ignore
                    const previous = document.getElementById(previousTile.current.id);
                    // @ts-ignore
                    const active = document.getElementById(activeTile.current.id)
                    // @ts-ignore
                    const piece = previous.firstChild;

                    if(activeTile.current != "") {
                        // @ts-ignore
                        if (activeTile.current.id == 'g1' && previousTile.current.id == 'e1') {
                            const rooktile = document.getElementById('h1') as HTMLDivElement;
                            const castleTile = document.getElementById('f1') as HTMLDivElement;
                            if (rooktile.firstChild) {
                                castleTile.appendChild(rooktile.firstChild)
                                // @ts-ignore
                                castleTile.firstChild.id = 'f1'
                            }
                            // @ts-ignore
                        } else if (activeTile.current.id == 'c1' && previousTile.current.id == 'e1') {
                            const rooktile = document.getElementById('a1') as HTMLDivElement;
                            const castleTile = document.getElementById('d1') as HTMLDivElement;
                            if (rooktile.firstChild) {
                                castleTile.appendChild(rooktile.firstChild)
                                // @ts-ignore
                                castleTile.firstChild.id = 'd1'
                            }
                            // @ts-ignore
                        } else if (activeTile.current.id == 'g8' && previousTile.current.id == 'e8') {
                            const rooktile = document.getElementById('h8') as HTMLDivElement;
                            const castleTile = document.getElementById('f8') as HTMLDivElement;
                            if (rooktile.firstChild) {
                                castleTile.appendChild(rooktile.firstChild)
                                // @ts-ignore
                                castleTile.firstChild.id = 'f8'
                            }

                            // @ts-ignore
                        } else if (activeTile.current.id == 'c8' && previousTile.current.id == 'e8') {
                            const rooktile = document.getElementById('a8') as HTMLDivElement;
                            const castleTile = document.getElementById('d8') as HTMLDivElement;
                            console.log(castleTile)
                            if (rooktile.firstChild) {
                                castleTile.appendChild(rooktile.firstChild)
                                // @ts-ignore
                                castleTile.firstChild.id = 'd8'
                            }
                        }
                    }

                    // @ts-ignore
                    previous.removeChild(previous.firstChild)

                    // @ts-ignore
                    if (active.firstChild != null) {
                        const pieces = document.getElementsByClassName('chess-piece');
                        for (let piecekey = 0; piecekey < pieces.length; piecekey++) {
                            // @ts-ignore
                            if (pieces[piecekey].id === active.firstChild.id) {
                                const capturedPiece = pieces[piecekey] as HTMLDivElement;
                                SetUserCapturedPieces(prevState =>[...prevState,capturedPiece.style.backgroundImage[18] + capturedPiece.style.backgroundImage[19]])
                                const score = scores.get(capturedPiece.style.backgroundImage[19]);
                                if(score) setUser_score(prevState => prevState+score)
                            }
                        }
                        // @ts-ignore
                        active.removeChild(active.firstChild)
                    }
                    // @ts-ignore
                    active.appendChild(piece);
                    // @ts-ignore
                    piece.id = active.id;


                    if (king.current != '') {
                        const king_square = document.getElementById(king.current);
                        // @ts-ignore
                        king_square.style.removeProperty('background-image');
                    }

                    sendJsonMessage({
                        type: "move",
                        // @ts-ignore
                        move: {from: previous.id, to: active.id, promotion: 0}
                    })

                    // @ts-ignore
                    active.firstChild.style.removeProperty('background-color');
                    // @ts-ignore
                    active.firstChild.style.border = 'none';
                    const chessboard = document.getElementById('chessboard') as HTMLElement;
                    chessboard.style.pointerEvents = "none";
                }
            }
        }
    }, [message, sendJsonMessage, UserCapturedPieces])

    function mainmenu(){
        gamestate.current = false
        nav("/")

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
                    <div className='captured-container'>
                        {OpponentCapturedPieces.map((piece) => (<div className='captured' style={{
                            backgroundImage: `url("../../images/${piece}.png")`,
                            width: '35px',
                            height: '35px'
                        }}></div>))}{opponent_score !== 0 ?
                        <text className='score'>+ {opponent_score}</text> : <></>}</div>
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

                    <div className="players"> You</div>
                    <div className='captured-container'>
                        {UserCapturedPieces.map((piece) => (<div className='captured' style={{
                            backgroundImage: `url("../../images/${piece}.png")`,
                            width: '35px',
                            height: '35px'
                        }}></div>))}{user_score !== 0 ?
                        <text className='score'>+ {user_score}</text> : <></>}</div>
                </div>
            </div>
            {game_over && <div className="win-container">
                <h1>{game_over}</h1>
                <button onClick={mainmenu}> Main Menu</button>
            </div>}
        </div>
    )

}

export default Game;