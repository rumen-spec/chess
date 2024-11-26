import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Game from "./pages/Game.tsx";
import {WebSocketProvider} from "./pages/WebSocketContext.tsx";
import Home from "./pages/Home.tsx";
import { SpeedInsights } from "@vercel/speed-insights/next"

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
                  <SpeedInsights/>
                      <Game/>
              </WebSocketProvider>
          }/>
          </Routes>
      </BrowserRouter>
  )
}

export default App
