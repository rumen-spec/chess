import "./Chessboard.css"
import Tile from "./Tile";
const verticalAxis = ["1", "2", "3", "4", "5", "6", "7", "8"];
const horizontalAxis = ["a", "b", "c", "d", "e", "f", "g", "h"];
const DEFAULT_POSITION: string = 'RNBQKBNRPPPPPPPPPPPPPPPPRNBQKBNR';

function Chessboard() {

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


    return (
        <div id="chessboard">
            {board}
        </div>
    )
}


export default Chessboard;