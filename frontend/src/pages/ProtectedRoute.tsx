import {Navigate, Outlet} from "react-router-dom";
import {useWebSocketContext} from "./WebSocketContext.tsx";
export function ProtectedRoute() {

    const {gamestate} = useWebSocketContext();
    console.log(gamestate);
    return gamestate.current ? <Outlet/>:<Navigate to={"https://chess-bay-kappa.vercel.app/"}/>
    }
