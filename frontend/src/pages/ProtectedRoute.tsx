import {Navigate, Outlet} from "react-router-dom";
import {useWebSocketContext} from "./WebSocketContext.tsx";


export function ProtectedRoute() {

    const {gamestate} = useWebSocketContext();
    console.log(gamestate.current);
    return gamestate.current ? <Outlet/>:<Navigate to={"/"}/>
    }
