import { WebSocket} from "ws";
import {Game} from './Game'
import {AVAILABLE_MOVES, CANCEL, DISCONNECT, INIT_GAME, MOVE} from "./messages";

export class GameManager {
    private games: Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];

    constructor() {
        this.games = []
        this.pendingUser = null;
        this.users = [];
    }

    addUser(socket: WebSocket){
        this.users.push(socket);
        this.addHandler(socket)
    }

    removeUser(socket: WebSocket){
        this.users.splice(this.users.indexOf(socket), 1);

    }

    test(socket: WebSocket){
        const game = this.games.find((game) => game.player1 == socket)
        const game1 = this.games.find((game) => game.player2 == socket)

            if(game){
                game.player2.send(JSON.stringify({
                    type: DISCONNECT
                }));

                this.games.splice(this.games.indexOf(game), 1);
                return;
            }
            if(game1){
                game1.player1.send(JSON.stringify({
                    type: DISCONNECT
                }));

                this.games.splice(this.games.indexOf(game1), 1);
                return;
            }
    }

    private addHandler(socket: WebSocket){
        socket.on("message", (data) => {
            const message = JSON.parse(data.toString());

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



        })
    }

}