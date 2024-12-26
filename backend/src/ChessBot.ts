import {WebSocket} from "ws";
import {Chess, Square} from "chess.js";
import {AVAILABLE_MOVES, CHECK, GAME_OVER, INIT_GAME, MOVE, moveType} from "./messages";

export class ChessBot {
    player: WebSocket
    board: Chess

    constructor(socket: WebSocket) {
        this.player = socket;
        this.board = new Chess();

        this.player.send(JSON.stringify({
            type: INIT_GAME,
            payload: {color: "white"}
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

        const bot_move = this.moves();
        console.log(this.board)
        this.board.move({from: bot_move[0].from, to: bot_move[0].to});
        this.player.send(JSON.stringify({
            type: MOVE,
            payload: bot_move[0],
        }))



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
        return;

    }

    private moves(){
        const moves: moveType[] = []
        const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
        for (var i = 0; i<letters.length; i++){
            for (let j = 1; j<=letters.length; j++){
                const m = letters[i] + j.toString();
                const n = this.board.moves({square: m as Square})
                n.forEach(v =>{
                    if(v.length == 3){
                        moves.push({from: m, to: v[1] + v[2], promotion: 0})
                    }else{
                        moves.push({from: m, to: v, promotion: 0})
                    }
                })
            }
        }

        return moves;
    }


}