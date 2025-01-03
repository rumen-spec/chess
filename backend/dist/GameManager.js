"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const Game_1 = require("./Game");
const messages_1 = require("./messages");
class GameManager {
    constructor() {
        this.games = [];
        this.pendingUser = null;
        this.users = [];
        this.bot_users = [];
    }
    addUser(socket) {
        this.users.push(socket);
        if (this.bot_users.includes(socket))
            this.addBothandler(socket);
        else {
            this.addHandler(socket);
        }
    }
    removeUser(socket) {
        const game = this.games.find((game) => game.player1 == socket);
        const game1 = this.games.find((game) => game.player2 == socket);
        if (game) {
            game.player2.send(JSON.stringify({
                type: messages_1.DISCONNECT
            }));
            this.games.splice(this.games.indexOf(game), 1);
        }
        else if (game1) {
            game1.player1.send(JSON.stringify({
                type: messages_1.DISCONNECT
            }));
            this.games.splice(this.games.indexOf(game1), 1);
        }
        this.users.splice(this.users.indexOf(socket), 1);
        this.bot_users.splice(this.users.indexOf(socket), 1);
    }
    addHandler(socket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
            if (message.type == messages_1.CHESSBOT) {
                this.bot_users.push(socket);
            }
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
        });
    }
    addBothandler(socket) {
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());
            if (message.type == messages_1.MOVE) {
            }
        });
    }
}
exports.GameManager = GameManager;
