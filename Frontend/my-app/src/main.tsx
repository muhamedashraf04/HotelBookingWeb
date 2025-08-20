import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.tsx";
import Create from "./Customer/Create.tsx"; // Import your Create component
import "./index.css";
import Getall from "./Rooms/Getall.tsx";
import Remove from "./Rooms/Remove.tsx";
import Available from "./Rooms/Available.tsx";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/App" element={<App />} />
        <Route path="/Customer/Create" element={<Create />} />
        <Route path="/Rooms/Get-All" element={<Getall />} />
        <Route path="/Rooms/Remove" element={<Remove />} />
        <Route path="/Rooms/Available" element={<Available />} />

        {/* Add other routes here */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
