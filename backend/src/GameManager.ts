import { WebSocket} from "ws";
import {Game} from './Game'
import {AVAILABLE_MOVES, CANCEL, DISCONNECT, INIT_GAME, MOVE, CHESSBOT, GAME_OVER} from "./messages";
import {ChessBot} from "./ChessBot";

interface Player{
    socket: WebSocket,
    mode: "pvp" | "chessbot" | null
}
export class GameManager {
    private games: Game[];
    private pendingUser: WebSocket | null;
    public users: WebSocket[];
    private bot_users: WebSocket[]
    private bot_games: ChessBot[];


    constructor() {
        this.games = []
        this.pendingUser = null;
        this.users = [];
        this.bot_users = []
        this.bot_games = [];
    }

    getPending(){
        return this.pendingUser
    }
    setPending(socket: WebSocket | null){
        this.pendingUser = socket;
    }

    addUser(socket: WebSocket){
        this.users.push(socket);
        this.Handler({socket: socket, mode: null})
    }

    removeUser(socket: WebSocket){
        const game = this.games.find((game) => game.player1 == socket)
        const game1 = this.games.find((game) => game.player2 == socket)
        const botgame = this.bot_games.find((game) => game.player = socket)

            if(game){
                game.player2.send(JSON.stringify({
                    type: DISCONNECT
                }));

                this.games.splice(this.games.indexOf(game), 1);
            }
            else if(game1){
                game1.player1.send(JSON.stringify({
                    type: DISCONNECT
                }));

                this.games.splice(this.games.indexOf(game1), 1);
            }else if(botgame){
                this.bot_games.splice(this.bot_games.indexOf(botgame), 1);
                this.bot_users.splice(this.bot_users.indexOf(socket))
                return
            }

            this.users.splice(this.users.indexOf(socket));
    }

    private Handler(player: Player){
        player.socket.on("message", (data) =>{
            const message = JSON.parse(data.toString())

            if(message.type == INIT_GAME){
                this.handlepvp(player.socket, message)
                player.mode = "pvp"
                return;
            }else if(message.type == CHESSBOT){
                player.mode = "chessbot"
                const game = new ChessBot(player.socket);
                this.users.splice(this.users.indexOf(player.socket), 1)
                this.bot_games.push(game)
                this.bot_users.push(player.socket)
            }
            if(player.mode === "pvp"){
                this.handlepvp(player.socket, message)
            }else if(player.mode === "chessbot"){
                this.handlebot(player.socket,message)
            }
        })
    }

    private handlepvp(socket: WebSocket, message: any){
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
        if(message.type === GAME_OVER){
            this.removeUser(socket)
        }
    }

    private handlebot(player: WebSocket, message: any){
            if(message.type === AVAILABLE_MOVES){
                const game = this.bot_games.find(socket => socket.player === player)
                if(game){
                    game.available_moves(message.position)
                }
            }
            if(message.type === MOVE){
                const game = this.bot_games.find(socket => socket.player === player)
                if(game){
                    game.makeMove(message.move)
                }
            }
            if(message.type === GAME_OVER){
                this.removeUser(player)
            }
    }

}