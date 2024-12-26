"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const Game_1 = require("./Game");
const messages_1 = require("./messages");
const ChessBot_1 = require("./ChessBot");
class GameManager {
    constructor() {
        this.games = [];
        this.botGames = [];
        this.pendingUser = null;
        this.users = [];
        this.bot_users = [];
    }
    addUser(socket) {
        this.users.push(socket);
        this.Handler(socket);
    }
    removeUser(socket) {
        const game = this.games.find((game) => game.player1 == socket);
        const game1 = this.games.find((game) => game.player2 == socket);
        if (game) {
            game.player2.send(JSON.stringify({
                type: messages_1.DISCONNECT
            }));
            console.log("before: ", this.games.length);
            this.games.splice(this.games.indexOf(game), 1);
            console.log("after: ", this.games.length);
            return;
        }
        else if (game1) {
            game1.player1.send(JSON.stringify({
                type: messages_1.DISCONNECT
            }));
            console.log("before: ", this.games.length);
            this.games.splice(this.games.indexOf(game1), 1);
            console.log("after: ", this.games.length);
            return;
        }
    }
    Handler(socket) {
        let bot = false;
        let pvp = false;
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
            if (message.type == messages_1.PLAYER) {
                pvp = true;
            }
            else if (message.type == messages_1.CHESSBOT) {
                bot = true;
            }
            if (message.type == messages_1.GAME_OVER) {
                this.removeUser(socket);
                bot = false;
                pvp = false;
            }
            if (bot) {
                this.botHandler(message, socket);
            }
            else if (pvp) {
                this.pvpHandler(message, socket);
            }
        });
    }
    pvpHandler(message, socket) {
        if (message.type === messages_1.INIT_GAME) {
            if (this.pendingUser && socket != this.pendingUser) {
                const game = new Game_1.Game(this.pendingUser, socket);
                this.games.push(game);
                this.pendingUser = null;
            }
            else {
                this.pendingUser = socket;
            }
        }
        if (message.type == messages_1.CANCEL) {
            if (this.pendingUser == socket) {
                if (this.users.length != 0) {
                    this.pendingUser = this.users[0];
                    this.users.splice(0, 1);
                }
                else {
                    this.pendingUser = null;
                }
            }
            else {
                this.users.splice(this.users.indexOf(socket), 1);
            }
        }
        if (message.type === messages_1.MOVE) {
            const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
            if (game) {
                game.makeMove(socket, message.move);
            }
        }
        if (message.type === messages_1.AVAILABLE_MOVES) {
            const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
            if (game) {
                game.available_moves(socket, message.position);
            }
        }
    }
    botHandler(message, socket) {
        console.log(message);
        if (message.type == messages_1.INIT_GAME) {
            const game = new ChessBot_1.ChessBot(socket);
            this.botGames.push(game);
        }
        if (message.type == messages_1.AVAILABLE_MOVES) {
            const game = this.botGames.find(game => game.player === socket);
            game === null || game === void 0 ? void 0 : game.available_moves(message.position);
        }
        if (message.type == messages_1.MOVE) {
            const game = this.botGames.find(game => game.player === socket);
            game === null || game === void 0 ? void 0 : game.makeMove(message.move);
        }
    }
}
exports.GameManager = GameManager;
