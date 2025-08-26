import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.tsx";
import Login from "./Auth/Login.tsx";
import Register from "./Auth/Register.tsx";
import Create from "./Customer/Create.tsx"; // Import your Create component
import "./index.css";
import SearchReservations from "./Reservations/Available.tsx";
import Booking from "./Reservations/Book.tsx";
import RemoveReservation from "./Reservations/Remove.tsx";
import Getall from "./Rooms/Getall.tsx";
import Remove from "./Rooms/RemoveAndEdit.tsx";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/App" element={<App />} />
        <Route path="/Customer/Create" element={<Create />} />
        <Route path="/Rooms/Get-All" element={<Getall />} />
        <Route path="/Rooms/Edit" element={<Remove />} />
        <Route path="/Reservations/Search" element={<SearchReservations />} />
        <Route path="/Reservations/Booking" element={<Booking />} />
        <Route path="/Reservations/Remove" element={<RemoveReservation />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />

        {/* Add other routes here */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
