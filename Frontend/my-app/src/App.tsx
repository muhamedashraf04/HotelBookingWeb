"use client";

import Header from "@/components/Header/Header";
import { DayPilot, DayPilotScheduler } from "@daypilot/daypilot-lite-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { Url } from "../GlobalVariables";
import ErrorToast from "../src/Toasts/ErrorToast";

export default function App() {
  const [resources, setResources] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [days, setDays] = useState(30); // default 30 days

  // ✅ Fetch function
  async function Get() {
    try {
      // ✅ Fetch rooms
      const response = await axios.get(`${Url}/Admin/Room/GetAll`);
      const formattedRooms = response.data.map((room: any) => ({
        id: room.id,
        name: `Room ${room.roomNumber} (${room.roomType})`,
      }));
      setResources(formattedRooms);

      // ✅ Fetch reservations
      const res = await axios.get(`${Url}/admin/reservation/getall`);
      const formattedReservations = res.data.map((r: any) => ({
        id: r.id,
        text: `Customer ${r.customerId} (${r.roomType})`,
        start: r.checkInDate,
        end: r.checkOutDate,
        resource: r.roomId,
      }));
      setEvents(formattedReservations);

      // ✅ Calculate furthest end date to adjust timeline
      if (formattedReservations.length > 0) {
        const furthest = new Date(
          Math.max(
            ...formattedReservations.map((r: any) => new Date(r.end).getTime())
          )
        );
        const today = new Date();
        const diffDays = Math.ceil(
          (furthest.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        setDays(Math.max(diffDays, 30) + 5); // at least 30 days
      }
    } catch (err: any) {
      ErrorToast(err.message || "Error fetching data");
    }
  }

  useEffect(() => {
    Get();
  }, []);

  return (
    <>
      <Header />
      <div className="flex justify-center mt-6 ">
        <div
          style={{
            width: "1000px",
            height: `${resources.length * 80}px`, // ✅ each room row ~80px tall
          }}
        >
          <DayPilotScheduler
            startDate={DayPilot.Date.today()}
            days={days}
            scale={"Day"}
            timeHeaders={[
              { groupBy: "Month" },
              { groupBy: "Day", format: "d" },
            ]}
            resources={resources}
            events={events}
            rowMarginBottom={50} // ✅ increase header row size
          />
        </div>
      </div>
    </>
  );
}
