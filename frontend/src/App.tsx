import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Game from "./pages/Game.tsx";
import {WebSocketProvider} from "./pages/WebSocketContext.tsx";
import Home from "./pages/Home.tsx";
import {useWebSocketContext} from "./pages/WebSocketContext.tsx";

const {gamestate} = useWebSocketContext();
console.log(gamestate + "  " + gamestate.current);

function App() {
    return(
      <BrowserRouter>
          <Routes>
          <Route path="/" element ={
              <WebSocketProvider>
                <Home/>
              </WebSocketProvider>
          }/>
          <Route path="/game" element={
              <WebSocketProvider>
                  {gamestate.current? <Game/>: <Home/>}
              </WebSocketProvider>
          }/>
          </Routes>
      </BrowserRouter>
  )
}

export default App
