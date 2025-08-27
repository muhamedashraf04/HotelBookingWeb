import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.tsx";
import Login from "./Auth/Login.tsx";
import Register from "./Auth/Register.tsx";
import Create from "./Customer/Create.tsx"; // Import your Create component
import "./index.css";
import Booking from "./Reservations/Book.tsx";
import Checkin from "./Reservations/Checkin.tsx";
import EditReservation from "./Reservations/EditReservation";
import RemoveReservation from "./Reservations/Remove.tsx";
import SearchReservations from "./Reservations/SearchReservations.tsx";
import CreateRoom from "./Rooms/CreateRoom.tsx";
import Edit from "./Rooms/Edit.tsx";
import CheckInPage from "./Checkin/CheckinPage.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/App" element={<App />} />
        <Route path="/Customer/Create" element={<Create />} />
        <Route path="/Rooms/Create" element={<CreateRoom />} />
        <Route path="/Rooms/Edit" element={<Edit />} />
        <Route path="/Reservations/Search" element={<SearchReservations />} />
        <Route path="/Reservations/Booking" element={<Booking />} />
        <Route path="/Reservations/Remove" element={<RemoveReservation />} />
        <Route path="/reservation/edit/:id" element={<EditReservation />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/Login" element={<Login />} />
<Route path="/checkin/:id" element={<CheckInPage />} />

        <Route path="/Reservations/Checkin" element={<Checkin />} />
        {/* Add other routes here */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
