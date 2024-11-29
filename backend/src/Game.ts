import {WebSocket} from "ws";
import {Chess, Square} from "chess.js";
import {AVAILABLE_MOVES, CHECK, GAME_OVER, INIT_GAME, MOVE} from "./messages";
import {GameManager} from "./GameManager";

export class Game {
    player1: WebSocket
    player2: WebSocket
    board: Chess
    private moves: string[]

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new Chess();
        this.moves = [];

        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: 'white'
            }
        }))
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color: 'black'
            }
        }))
    }

    available_moves(socket: WebSocket, position: Square){
        socket.send(JSON.stringify({
            type: AVAILABLE_MOVES,
            square: position,
            payload: this.board.moves({square:position})
        }))
    }


    makeMove(socket: WebSocket, move: { from: string, to: string, promotion: number }) {
        if(this.moves.length % 2 === 0 && socket !== this.player1){
            return;
        }
        if(this.moves.length % 2 === 1 && socket !== this.player2){
            return;
        }
        try{
            if(move.promotion == 0){
                const flag: string = this.board.move({from:move.from, to:move.to}).flags
                if(flag == "e"){
                    this.player1.send(JSON.stringify({
                        type:"en-passant",
                        move: {from: move.from, to: move.to},
                        turn: socket === this.player1
                    }))
                    this.player2.send(JSON.stringify({
                        type:"en-passant",
                        move: {from: move.from, to: move.to},
                        turn: socket === this.player2
                    }))
                }
            }else{
                console.error("hiiiiiii");
                this.board.move({from:move.from, to:move.to, promotion: "q"})
            }
            this.moves.push(JSON.stringify(move));
        }catch(e){
            console.error(e);
            return;
        }


        if(this.moves.length % 2 === 0){
            this.player1.send(JSON.stringify({
                type: MOVE,
                payload: move,
            }))

            if(this.board.inCheck()){
                this.player1.send(JSON.stringify({
                    type: CHECK,
                }))
            }
        }
        if(this.moves.length % 2 === 1){
            this.player2.send(JSON.stringify({
                type: MOVE,
                payload: move
            }))
            if(this.board.inCheck()){
                this.player2.send(JSON.stringify({
                    type: CHECK,
                }))
            }
        }
        if(this.board.isGameOver()){
            if(this.board.isCheckmate()) {
                this.player1.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        how: "checkmate",
                        winner: this.board.turn() === 'w' ? "black" : "white"
                    }
                }))
                this.player2.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        how: "checkmate",
                        winner: this.board.turn() === 'w' ? "black" : "white"
                    }
                }))
            }else if(this.board.isStalemate()){
                this.player1.send(JSON.stringify({
                    type: GAME_OVER,
                    payload: {
                        how: "stalemate",
                        winner: this.board.turn() === 'w' ? "black" : "white"
                    }
                }))
                this.player2.send(JSON.stringify({
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