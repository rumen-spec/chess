import './App.css'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Game from "./pages/Game.tsx";

function App() {

    return(
      <BrowserRouter>
          <Routes>
          <Route path="/" element ={<Game/>}/>
          <Route path="/game" element={<Game/>}/>
          </Routes>
      </BrowserRouter>
  )
}

export default App
