"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess();
        this.moves = [];
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: 'white'
            }
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: 'black'
            }
        }));
    }
    available_moves(socket, position) {
        socket.send(JSON.stringify({
            type: messages_1.AVAILABLE_MOVES,
            square: position,
            payload: this.board.moves({ square: position })
        }));
    }
    makeMove(socket, move) {
        if (this.moves.length % 2 === 0 && socket !== this.player1) {
            return;
        }
        if (this.moves.length % 2 === 1 && socket !== this.player2) {
            return;
        }
        try {
            this.board.move(move);
            this.moves.push(JSON.stringify(move));
        }
        catch (e) {
            console.error(e);
            return;
        }
        if (this.board.isGameOver()) {
            this.player1.send(JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: {
                    winner: this.board.turn() === 'w' ? "black" : "white"
                }
            }));
            this.player2.send(JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: {
                    winner: this.board.turn() === 'w' ? "black" : "white"
                }
            }));
            return;
        }
        if (this.moves.length % 2 === 0) {
            this.player1.send(JSON.stringify({
                type: messages_1.MOVE,
                payload: move
            }));
        }
        if (this.moves.length % 2 === 1) {
            this.player2.send(JSON.stringify({
                type: messages_1.MOVE,
                payload: move
            }));
        }
    }
}
exports.Game = Game;
