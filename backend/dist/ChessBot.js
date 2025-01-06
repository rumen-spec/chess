"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChessBot = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
class ChessBot {
    constructor(socket) {
        this.player = socket;
        this.seenPositions = new Map();
        this.board = new chess_js_1.Chess();
        this.player.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: 'white'
            }
        }));
    }
    available_moves(position) {
        const formatted = [];
        const moves = this.board.moves({ square: position, verbose: true });
        moves.forEach(move => {
            formatted.push(move.to);
        });
        this.player.send(JSON.stringify({
            type: messages_1.AVAILABLE_MOVES,
            square: position,
            payload: formatted
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
            }
        }
        catch (e) {
            console.error(e);
            return;
        }
        const best = this.findBestMoveForBlack(4);
        if (best) {
            if (best.flags.includes("p")) {
                this.board.move({ from: best.from, to: best.to, promotion: "q" });
                this.player.send(JSON.stringify({
                    type: messages_1.MOVE,
                    payload: {
                        from: best.from,
                        to: best.to,
                        promotion: 1
                    },
                }));
            }
            else {
                this.board.move({ from: best.from, to: best.to });
                this.player.send(JSON.stringify({
                    type: messages_1.MOVE,
                    payload: {
                        from: best.from,
                        to: best.to,
                    },
                }));
            }
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
    // private moves() {
    //     const moves: moveType[] = [];
    //     const letters = ["a", "b", "c", "d", "e", "f", "g", "h"];
    //     for (var i = 0; i < letters.length; i++) {
    //         for (let j = 1; j <= letters.length; j++) {
    //             const m = letters[i] + j.toString();
    //             const n = this.board.moves({ square: m as Square });
    //             n.forEach(v => {
    //                 if(v.length == 4){
    //                     moves.push({ from: m, to: v[2] + v[3], promotion: 0 });
    //                 }
    //                 if (v.length == 3) {
    //                     moves.push({ from: m, to: v[1] + v[2], promotion: 0 });
    //                 }
    //                 else {
    //                     moves.push({ from: m, to: v, promotion: 0 });
    //                 }
    //             });
    //         }
    //     }
    //     return moves;
    // }
    evaluateBoard() {
        const pieceValues = {
            p: 1, n: 3, b: 3, r: 5, q: 9, k: 0
        };
        const centerSquares = ['d4', 'd5', 'e4', 'e5'];
        const centerBonus = 0.5; // Reward for occupying central squares
        let board = this.board.board();
        let evaluation = 0;
        for (let row of board) {
            for (let square of row) {
                if (square) {
                    let value = pieceValues[square.type];
                    evaluation += square.color === 'w' ? value : -value;
                    // Add a bonus for central control
                    if (centerSquares.includes(square.square)) {
                        evaluation += square.color === 'w' ? centerBonus : -centerBonus;
                    }
                }
            }
        }
        return evaluation;
    }
    minimaxAlphaBeta(depth, alpha, beta, isMaximizingPlayer) {
        let fen = this.board.fen();
        if (this.seenPositions.has(fen)) {
            return this.evaluateBoard() - 0.1 * depth; // Penalize repeated positions slightly
        }
        this.seenPositions.set(fen, true);
        if (depth === 0 || this.board.isGameOver()) {
            return this.evaluateBoard();
        }
        let moves = this.board.moves({ verbose: true });
        if (isMaximizingPlayer) {
            let maxEval = -Infinity;
            for (let move of moves) {
                this.board.move(move.san);
                let evalu = this.minimaxAlphaBeta(depth - 1, alpha, beta, false);
                this.board.undo();
                maxEval = Math.max(maxEval, evalu);
                alpha = Math.max(alpha, evalu);
                if (beta <= alpha)
                    break;
            }
            return maxEval;
        }
        else {
            let minEval = Infinity;
            for (let move of moves) {
                this.board.move(move.san);
                let evalu = this.minimaxAlphaBeta(depth - 1, alpha, beta, true);
                this.board.undo();
                minEval = Math.min(minEval, evalu);
                beta = Math.min(beta, evalu);
                if (beta <= alpha)
                    break;
            }
            return minEval;
        }
    }
    findBestMoveForBlack(depth) {
        let bestMove = null;
        let bestValue = Infinity; // Initialize to a very high value since Black minimizes
        let lastMove = this.board.history({ verbose: true }).slice(-1)[0]; // Get the last move (if any)
        let moves = this.board.moves({ verbose: true });
        for (let move of moves) {
            if (lastMove && move.from === lastMove.to && move.to === lastMove.from) {
                continue; // Skip repeating the exact reverse of the last move
            }
            this.board.move(move.san);
            let boardValue = this.minimaxAlphaBeta(depth - 1, -Infinity, Infinity, true);
            this.board.undo();
            if (boardValue < bestValue) {
                bestValue = boardValue;
                bestMove = move;
            }
        }
        return bestMove;
    }
}
exports.ChessBot = ChessBot;
