import { WebSocket} from "ws";
import {Game} from './Game'
import {AVAILABLE_MOVES, CANCEL, DISCONNECT, INIT_GAME, MOVE, CHESSBOT} from "./messages";

interface Player{
    socket: WebSocket,
    mode: "pvp" | "chessbot" | null
}
export class GameManager {
    private games: Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];
    private bot_users: WebSocket[];


    constructor() {
        this.games = []
        this.pendingUser = null;
        this.users = [];
        this.bot_users = [];
    }

    addUser(socket: WebSocket){
        this.users.push(socket);
        this.Handler({socket: socket, mode: null})
    }

    removeUser(socket: WebSocket){
        const game = this.games.find((game) => game.player1 == socket)
        const game1 = this.games.find((game) => game.player2 == socket)

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
            }

            this.users.splice(this.users.indexOf(socket), 1);
            this.bot_users.splice(this.users.indexOf(socket), 1);
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
            }
            if(player.mode === "pvp"){
                this.handlepvp(player.socket, message)
            }else if(player.mode === "chessbot"){
                this.handlebot(message)
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
    }

    private handlebot(message: any){
            if(message.type == MOVE){

            }
    }

}