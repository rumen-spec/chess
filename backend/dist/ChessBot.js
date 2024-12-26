"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChessBot = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
class ChessBot {
    constructor(socket) {
        this.player = socket;
        this.board = new chess_js_1.Chess();
        this.player.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            colour: "white"
        }));
    }
    available_moves(position) {
        this.player.send(JSON.stringify({
            type: messages_1.AVAILABLE_MOVES,
            square: position,
            payload: this.board.moves({ square: position })
        }));
    }
    makeMove(move) {
        if (this.board.turn() != 'w') {
            return;
        }
        try {
            if (move.promotion == 0) {
                const flag = this.board.move({ from: move.from, to: move.to }).flags;
                if (flag == "e") {
                    this.player.send(JSON.stringify({
                        type: "en-passant",
                        move: { from: move.from, to: move.to },
                        turn: true
                    }));
                }
            }
            else {
                this.board.move({ from: move.from, to: move.to, promotion: "q" });
                const moves = this.board.moves();
                console.log(moves);
            }
        }
        catch (e) {
            console.error(e);
            return;
        }
        if (this.board.isGameOver()) {
            if (this.board.isCheckmate()) {
                this.player.send(JSON.stringify({
                    type: messages_1.GAME_OVER,
                    payload: {
                        how: "checkmate",
                        winner: this.board.turn() === 'w' ? "black" : "white"
                    }
                }));
            }
            else if (this.board.isStalemate()) {
                this.player.send(JSON.stringify({
                    type: messages_1.GAME_OVER,
                    payload: {
                        how: "stalemate",
                        winner: this.board.turn() === 'w' ? "black" : "white"
                    }
                }));
            }
            this.board.clear();
            return;
        }
    }
}
exports.ChessBot = ChessBot;
