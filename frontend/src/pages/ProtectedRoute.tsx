import {Navigate, Outlet} from "react-router-dom";
import {useWebSocketContext} from "./WebSocketContext.tsx";
export function ProtectedRoute() {

    const {gamestate} = useWebSocketContext();
    return gamestate.current ? <Outlet/>:<Navigate to={'/'}/>
    }
