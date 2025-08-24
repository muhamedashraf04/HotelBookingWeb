import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.tsx";
import Create from "./Customer/Create.tsx"; // Import your Create component
import "./index.css";
import Available from "./Reservations/Available.tsx";
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
        <Route path="/Reservations/Available" element={<Available />} />
        <Route path="/Reservations/Booking" element={<Booking />} />
        <Route path="/Reservations/Remove" element={<RemoveReservation />} />
        {/* Add other routes here */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
