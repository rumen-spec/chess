import "./Chessboard.css"
import Tile from "./Tile";
import React, {useState} from "react";
import send from './Game.tsx'
import useWebSocket, {ReadyState} from 'react-use-websocket';

const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];
const DEFAULT_POSITION = 'RNBQKBNRPPPPPPPPPPPPPPPPRNBQKBNR'


interface ChessboardProps {
    sendJsonMessage: (message: any) => void,
}

function Chessboard({sendJsonMessage}: ChessboardProps) {

    let counter = 0;
    let counter2 = 0;
    let board = [];
    for (let i = 7; i >= 0; i--) {
        counter = i;
        for (let j = 0; j < horizontalAxis.length; j++) {
            let id = `${horizontalAxis[j]}${verticalAxis[i]}`
            let img = '';
            if (id[1] === '8' || id[1] === '7') {
                img = 'b' + DEFAULT_POSITION[counter2];
                counter2 += 1;
            }
            if (id[1] === '1' || id[1] === '2') {
                img = 'w' + DEFAULT_POSITION[counter2];
                counter2 += 1;
            }
            board.push(<Tile num={counter} id={id} image={img}/>)
            counter += 1;
        }
    }

    // const movepiece = (e: React.MouseEvent) => {
    //     const element = e.target as HTMLDivElement;
    //     if (element.classList.contains('chess-piece')) {
    //         const board = document.getElementById('chessboard')?.getBoundingClientRect();
    //
    //
    //         element.style.position = `absolute`
    //         element.style.left = `${e.screenX - board.x - (horizontalAxis.indexOf(element.id[0]) * 100) -50}px`;
    //         element.style.top = `${e.screenY - board.y - (parseInt(element.id[1]) * 120) -50}px`;
    //         console.log(element.style.left, element.style.top);
    //
    //     }
    // };

    const grabPiece = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        // const element = e.target as HTMLDivElement;
        // if (element.classList.contains('chess-piece')) {
        //     const board = document.getElementById('chessboard')?.getBoundingClientRect();
        //
        //
        //     element.style.position = `absolute`
        //     element.style.left = `${e.screenX - board.x - (horizontalAxis.indexOf(element.id[0]) * 100) -50}px`;
        //     element.style.top = `${e.screenY - board.y - (parseInt(element.id[1]) * 120) -50}px`;
        //     console.log(element.style.left, element.style.top);
        //
        //     sendJsonMessage({
        //         type: 'available_moves',
        //         position: element.id
        //     })
        // }

    }

    return (
        <div id="chessboard" onMouseDown={e => (grabPiece(e))}>
            {board}
        </div>
    )
}


export default Chessboard;