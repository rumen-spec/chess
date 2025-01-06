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
        const formatted = [];
        const moves = this.board.moves({ square: position, verbose: true });
        moves.forEach(move => {
            formatted.push(move.to);
        });
        socket.send(JSON.stringify({
            type: messages_1.AVAILABLE_MOVES,
            square: position,
            payload: formatted
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
            if (move.promotion == 0) {
                const flag = this.board.move({ from: move.from, to: move.to }).flags;
                if (flag == "e") {
                    this.player1.send(JSON.stringify({
                        type: "en-passant",
                        move: { from: move.from, to: move.to },
                        turn: socket === this.player1
                    }));
                    this.player2.send(JSON.stringify({
                        type: "en-passant",
                        move: { from: move.from, to: move.to },
                        turn: socket === this.player2
                    }));
                }
            }
            else {
                this.board.move({ from: move.from, to: move.to, promotion: "q" });
            }
            this.moves.push(JSON.stringify(move));
        }
        catch (e) {
            console.error(e);
            return;
        }
        if (this.moves.length % 2 === 0) {
            this.player1.send(JSON.stringify({
                type: messages_1.MOVE,
                payload: move,
            }));
            if (this.board.inCheck()) {
                this.player1.send(JSON.stringify({
                    type: messages_1.CHECK,
                }));
            }
        }
        if (this.moves.length % 2 === 1) {
            this.player2.send(JSON.stringify({
                type: messages_1.MOVE,
                payload: move
            }));
            if (this.board.inCheck()) {
                this.player2.send(JSON.stringify({
                    type: messages_1.CHECK,
                }));
            }
        }
        if (this.board.isGameOver()) {
            if (this.board.isCheckmate()) {
                this.player1.send(JSON.stringify({
                    type: messages_1.GAME_OVER,
                    payload: {
                        how: "checkmate",
                        winner: this.board.turn() === 'w' ? "black" : "white"
                    }
                }));
                this.player2.send(JSON.stringify({
                    type: messages_1.GAME_OVER,
                    payload: {
                        how: "checkmate",
                        winner: this.board.turn() === 'w' ? "black" : "white"
                    }
                }));
            }
            else if (this.board.isStalemate()) {
                this.player1.send(JSON.stringify({
                    type: messages_1.GAME_OVER,
                    payload: {
                        how: "stalemate",
                        winner: this.board.turn() === 'w' ? "black" : "white"
                    }
                }));
                this.player2.send(JSON.stringify({
                    type: messages_1.GAME_OVER,
                    payload: {
                        how: "stalemate",
                        winner: this.board.turn() === 'w' ? "black" : "white"
                    }
                }));
            }
        }
    }
}
exports.Game = Game;
