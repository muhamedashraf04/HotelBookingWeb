"use client";
import Header from "@/components/Header/Header";

function App() {

import React, { useEffect, useState } from "react";
import { DayPilot, DayPilotScheduler } from "@daypilot/daypilot-lite-react";

export default function Scheduler() {
  const [resources, setResources] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // ✅ Fetch rooms
    fetch("http://localhost:5000/Admin/Room/GetAll")
      .then((res) => res.json())
      .then((data) => {
        const formattedRooms = data.map((room: any) => ({
          id: room.id, // resource ID
          name: `Room ${room.roomNumber} (${room.roomType})`, // displayed in column
        }));
        setResources(formattedRooms);
      });

    // ✅ Fetch reservations
    fetch("http://localhost:5000/api/reservations")
      .then((res) => res.json())
      .then((data) => {
        const formattedReservations = data.map((r: any) => ({
          id: r.id,
          text: r.customer,
          start: r.start,
          end: r.end,
          resource: r.roomId, // must match resource id above
        }));
        setEvents(formattedReservations);
      });
  }, []);

  return (
    <>
      <Header />
    </>
  );
}

export default App;
    <div className="flex justify-center mt-6">
      <div style={{ width: "1000px", height: "500px" }}>
        <DayPilotScheduler
          startDate={DayPilot.Date.today()}
          days={30}
          scale={"Day"}
          timeHeaders={[
            { groupBy: "Month" },
            { groupBy: "Day", format: "d" },
          ]}
          resources={resources}  // ✅ only this is needed
          events={events}
        />
      </div>
    </div>
  );
}
