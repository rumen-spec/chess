import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Game from "./pages/Game.tsx";
import Chessboard from "./pages/Chessboard.tsx";
import useWebSocket from "react-use-websocket";
import {useState} from "react";

function App() {
    const [message, sendJsonMessage] = useState('');
    return(
      <BrowserRouter>
          <Routes>
          <Route path="/" element ={<Game/>}/>
          <Route path="/game" element={<Chessboard sendJsonMessage={sendJsonMessage}/>}/>
          </Routes>
      </BrowserRouter>
  )
}

export default App
