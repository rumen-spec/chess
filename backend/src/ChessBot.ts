import {WebSocket} from "ws";
import {Chess, Square} from "chess.js";
import {AVAILABLE_MOVES, CHECK, GAME_OVER, INIT_GAME, MOVE} from "./messages";

export class ChessBot {
    player: WebSocket
    board: Chess

    constructor(socket: WebSocket) {
        this.player = socket;
        this.board = new Chess();

        this.player.send(JSON.stringify({
            type: INIT_GAME,
            colour: "white"
        }))
    }

    available_moves(position: Square){
        this.player.send(JSON.stringify({
            type: AVAILABLE_MOVES,
            square: position,
            payload: this.board.moves({square:position})
        }))
    }

    makeMove(move: { from: string, to: string, promotion: number }) {

        if(this.board.turn() != 'w'){
            return;
        }
        try{
            if(move.promotion == 0){
                const flag: string = this.board.move({from:move.from, to:move.to}).flags
                if(flag == "e"){
                    this.player.send(JSON.stringify({
                        type:"en-passant",
                        move: {from: move.from, to: move.to},
                        turn: true
                    }))
                }

            }else{
                this.board.move({from:move.from, to:move.to, promotion: "q"})
                const moves = this.board.moves();
                console.log(moves);
            }
        }catch(e){
            console.error(e);
            return;
        }

        if(this.board.isGameOver()){
            if(this.board.isCheckmate()) {
                this.player.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        how: "checkmate",
                        winner: this.board.turn() === 'w' ? "black" : "white"
                    }
                }))
            }else if(this.board.isStalemate()){
                this.player.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        how: "stalemate",
                        winner: this.board.turn() === 'w' ? "black" : "white"
                    }
                }))
            }
            this.board.clear();
            return;
        }

    }

}