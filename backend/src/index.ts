import {WebSocketServer} from 'ws';
import {GameManager} from "./GameManager";

const wss = new WebSocketServer({ port:8080 });
const gameManager = new GameManager();

wss.on('connection', (ws) => {
    gameManager.addUser(ws)
    ws.on('close', () => {
        gameManager.removeUser(ws);
        gameManager.users.splice(gameManager.users.indexOf(ws), 1);
        gameManager.bot_users.splice(gameManager.users.indexOf(ws), 1);
    })
});