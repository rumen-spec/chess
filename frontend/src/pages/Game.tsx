import useWebSocket from "react-use-websocket";
import './Game.css';
import Chessboard from "./Chessboard.tsx";
import {useEffect, useRef, useState} from "react";
import {useWebSocketContext} from "./WebSocketContext.tsx";

function Game() {



    const activeTile = useRef<HTMLElement | ''>('');
    const previousTile = useRef<HTMLElement | ''>('');
    const king = useRef<string>('');
    const previousmoves = useRef<string[]>([]);
    const turn = useRef<boolean>(false);
    const [white, setWhite] = useState<boolean>(true);
    let moves: string[] = [];
    const movelist = useRef<string[]>([]);
    const {messages, sendJsonMessage} = useWebSocketContext()


        // function eventHandler(m: any) {
        const message = messages.current

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

            if (turn.current) {
                sendJsonMessage({
                    type: "available_moves",
                    position: element.id,
                });
            }
        }

        useEffect(() => {
            console.log(message);

            if (message!==undefined){// if another user joins game
                if (message.type === "init_game") {
                    turn.current = true;

                    if (message.payload.color == 'black') {
                        setWhite(false);
                        const Chessboard = document.getElementById('chessboard') as HTMLElement;
                        turn.current = false;
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

                if (message.type === "move") {
                    const startingtile = document.getElementById(message.payload.from) as HTMLDivElement;
                    const endingtile = document.getElementById(message.payload.to) as HTMLDivElement;

                    movelist.current.push(message.payload.from + '→' + message.payload.to);

                    turn.current = true;

                    const piece = startingtile.firstChild as HTMLDivElement;
                    startingtile.removeChild(piece);
                    piece.id = endingtile.id;

                    if (endingtile.firstChild != null) {
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
                            castleTile.firstChild.id = 'f1'
                        }
                    } else if (message.payload.from == 'e1' && message.payload.to == 'c1') {
                        const rooktile = document.getElementById('a1') as HTMLDivElement;
                        const castleTile = document.getElementById('d1') as HTMLDivElement;
                        if (rooktile.firstChild) {
                            castleTile.appendChild(rooktile.firstChild)
                            castleTile.firstChild.id = 'd1'
                        }
                    } else if (message.payload.from == 'e8' && message.payload.to == 'g8') {
                        const rooktile = document.getElementById('h8') as HTMLDivElement;
                        const castleTile = document.getElementById('f8') as HTMLDivElement;
                        if (rooktile.firstChild) {
                            castleTile.appendChild(rooktile.firstChild)
                            castleTile.firstChild.id = 'f8'
                        }
                    } else if (message.payload.from == 'e8' && message.payload.to == 'c8') {
                        const rooktile = document.getElementById('a8') as HTMLDivElement;
                        const castleTile = document.getElementById('d8') as HTMLDivElement;
                        if (rooktile.firstChild) {
                            castleTile.appendChild(rooktile.firstChild)
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
                            tile.style.removeProperty("background-image");
                        }
                        previousTile.current.style.removeProperty("background-color");
                        previousTile.current.style.border = 'none';
                    }

                    if (previousmoves.current.includes(activeTile.current.id) && turn.current) {
                        for (let i = 0; i < previousmoves.current.length; i++) {
                            const tile = document.getElementById(previousmoves.current[i]);
                            tile.style.removeProperty("background-image");
                        }
                        const previous = document.getElementById(previousTile.current.id);
                        const active = document.getElementById(activeTile.current.id)
                        const piece = previous.firstChild;
                        if (activeTile.current.id == 'g1' && previousTile.current.id == 'e1') {
                            const rooktile = document.getElementById('h1') as HTMLDivElement;
                            const castleTile = document.getElementById('f1') as HTMLDivElement;
                            if (rooktile.firstChild) {
                                castleTile.appendChild(rooktile.firstChild)
                                castleTile.firstChild.id = 'f1'
                            }
                        } else if (activeTile.current.id == 'c1' && previousTile.current.id == 'e1') {
                            const rooktile = document.getElementById('a1') as HTMLDivElement;
                            const castleTile = document.getElementById('d1') as HTMLDivElement;
                            if (rooktile.firstChild) {
                                castleTile.appendChild(rooktile.firstChild)
                                castleTile.firstChild.id = 'd1'
                            }
                        } else if (activeTile.current.id == 'g8' && previousTile.current.id == 'e8') {
                            const rooktile = document.getElementById('h8') as HTMLDivElement;
                            const castleTile = document.getElementById('f8') as HTMLDivElement;
                            if (rooktile.firstChild) {
                                castleTile.appendChild(rooktile.firstChild)
                                castleTile.firstChild.id = 'f8'
                            }
                        } else if (activeTile.current.id == 'c8' && previousTile.current.id == 'e8') {
                            const rooktile = document.getElementById('a8') as HTMLDivElement;
                            const castleTile = document.getElementById('d8') as HTMLDivElement;
                            console.log(castleTile)
                            if (rooktile.firstChild) {
                                castleTile.appendChild(rooktile.firstChild)
                                castleTile.firstChild.id = 'd8'
                            }
                        }

                        previous.removeChild(previous.firstChild)

                        if (active.firstChild != null) {
                            active.removeChild(active.firstChild)
                        }
                        active.appendChild(piece);
                        piece.id = active.id;


                        if (king.current != '') {
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
            }
        }, [message])

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

                        <div> You</div>
                        <div className="captured-pieces"></div>
                    </div>
                    {/*<div className='moves'> <h1>{movelist.current}</h1></div>*/}
                </div>
                {/*{!gameState && <div className="controls-container">*/}
                {/*    <h1 className="game-title">Play Chess</h1>*/}
                {/*    <div className="button-container">*/}
                {/*        <button onClick={startgame} className="text">Play Online</button>*/}
                {/*        <button className="text">Play vs Bot</button>*/}
                {/*    </div>*/}
                {/*</div>}*/}
            </div>
        )

    }

export default Game;