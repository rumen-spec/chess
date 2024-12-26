import { WebSocket} from "ws";
import {Game} from './Game'
import {AVAILABLE_MOVES, CANCEL, DISCONNECT, INIT_GAME, MOVE, CHESSBOT, GAME_OVER, PLAYER} from "./messages";
import {ChessBot} from "./ChessBot";
import {Chess, WHITE} from "chess.js";

export class GameManager {
    public games: Game[];
    public botGames: ChessBot[]
    private pendingUser: WebSocket | null;
    public users: WebSocket[];
    public bot_users: WebSocket[];

    constructor() {
        this.games = []
        this.botGames = []
        this.pendingUser = null;
        this.users = [];
        this.bot_users = [];
    }

    addUser(socket: WebSocket){
        this.users.push(socket);
        this.Handler(socket);
    }

    removeUser(socket: WebSocket){
        const game = this.games.find((game) => game.player1 == socket)
        const game1 = this.games.find((game) => game.player2 == socket)

            if(game){
                game.player2.send(JSON.stringify({
                    type: DISCONNECT
                }));

                console.log("before: ", this.games.length)
                this.games.splice(this.games.indexOf(game), 1);
                console.log("after: ", this.games.length)
                return;
            }
            else if(game1){
                game1.player1.send(JSON.stringify({
                    type: DISCONNECT
                }));

                console.log("before: ", this.games.length)
                this.games.splice(this.games.indexOf(game1), 1);
                console.log("after: ", this.games.length)
                return
            }

    }

    private Handler(socket: WebSocket){
        let bot = false;
        let pvp = false;
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());

            if(message.type == PLAYER){
                pvp = true
            }else if(message.type == CHESSBOT){
                bot = true;
            }

            if(message.type == GAME_OVER){
                this.removeUser(socket);
                bot = false;
                pvp = false;
            }

            if(bot){
                this.botHandler(message, socket)
            }else if(pvp){
                this.pvpHandler(message,socket)
            }
        })
    }

    private pvpHandler(message: any, socket: WebSocket){
            if (message.type === INIT_GAME) {
                if(this.pendingUser && socket != this.pendingUser){
                    const game = new Game(this.pendingUser, socket)
                    this.games.push(game);
                    this.pendingUser = null;
                }else{
                    this.pendingUser = socket;
                }
            }

            if(message.type == CANCEL){

                if(this.pendingUser == socket){
                    if(this.users.length != 0){
                        this.pendingUser = this.users[0];
                        this.users.splice(0, 1);
                    }else {
                        this.pendingUser = null;
                    }
                }else{
                    this.users.splice(this.users.indexOf(socket), 1);
                }
            }

            if(message.type === MOVE){
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket)
                if(game) {
                    game.makeMove(socket, message.move)
                }
            }

            if(message.type === AVAILABLE_MOVES){
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket)
                if(game) {
                    game.available_moves(socket, message.position)
                }
            }
    }

    private botHandler(message: any, socket: WebSocket) {
        console.log(message);

        if (message.type == INIT_GAME) {
            const game = new ChessBot(socket);
            this.botGames.push(game);
        }

        if (message.type == AVAILABLE_MOVES) {
            const game = this.botGames.find(game => game.player === socket)
            game?.available_moves(message.position)
        }
        if (message.type == MOVE) {
            const game = this.botGames.find(game => game.player === socket)
            game?.makeMove(message.move)
        }
    }
}