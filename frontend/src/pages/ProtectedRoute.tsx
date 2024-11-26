import {Navigate, Outlet} from "react-router-dom";
import {useWebSocketContext} from "./WebSocketContext.tsx";


export function ProtectedRoute({ children }: any) {

    const {gamestate} = useWebSocketContext();
    console.log(children)
    console.log(gamestate.current);
    return gamestate.current ? <Outlet/>:<Navigate to={"https://chess-bay-kappa.vercel.app/"}/>
    }
