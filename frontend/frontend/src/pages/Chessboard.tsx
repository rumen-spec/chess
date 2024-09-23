import "./Chessboard.css"
import Tile from "./Tile";
import React, {useState} from "react";
import sendJsonMessage from './Game.tsx'
import useWebSocket, { ReadyState } from 'react-use-websocket';

const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];
const DEFAULT_POSITION = 'RNBQKBNRPPPPPPPPPPPPPPPPRNBQKBNR'

function Chessboard() {
    // const socketUrl = 'ws://localhost:8080';
    // const {
    //     sendMessage,
    //     sendJsonMessage,
    //     lastMessage,
    //     lastJsonMessage,
    //     readyState,
    //     getWebSocket,
    // } = useWebSocket(socketUrl, {
    //     onOpen: () => console.log('Connected'),
    //     shouldReconnect: (closeEvent) => true,
    // });

    let counter = 0;
    let counter2 = 0;
    let board = [];
    for (let i = 7; i >= 0; i--) {
        counter = i;
        for (let j = 0; j < horizontalAxis.length; j++) {
            let id = `${horizontalAxis[j]}${verticalAxis[i]}`
            let img = '';
            if(id[1] === '8' || id[1] === '7') {
                img = 'b' + DEFAULT_POSITION[counter2];
                counter2 +=1;
            } if(id[1] === '1' || id[1] === '2') {
                img = 'w' + DEFAULT_POSITION[counter2];
                counter2 +=1;
            }
            board.push(<Tile num={counter} id={id} image={img}/>)
            counter += 1;
        }
    }

    const grabPiece = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        sendJsonMessage({
            "type": "available_moves",
            "position": e.target.id
        })
        console.log(lastJsonMessage)
        console.log(readyState)
    }

    return (
        <div id="chessboard" onMouseDown={e =>(grabPiece(e))}>
            {board}
        </div>
    )
}


export default Chessboard;