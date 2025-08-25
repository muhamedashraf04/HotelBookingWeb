"use client";

import Header from "@/components/Header/Header";
import { DayPilot, DayPilotScheduler } from "@daypilot/daypilot-lite-react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import axios from "axios";
import Popup from "./DeletePopup";
import { Url } from "../GlobalVariables";
import ErrorToast from "../src/Toasts/ErrorToast";

type Reservation = {
  id: number;
  customerId: number;
  customerName?: string; // <--- store name here
  roomId: number;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfExtraBeds: number;
};

type Customer = {
  id: number;
  name: string;
};

type Data = {
  id: number;
  message: string;
  Area: string;
  Controller: string;
  Action: string;
};

function createData(id: number, customerName: string): Data {
  return {
    id,
    message: `This will permanently delete Reservation for ${customerName}. This action cannot be undone.`,
    Area: "Admin",
    Controller: "Reservation",
    Action: "Remove",
  };
}

export default function App() {
  const [resources, setResources] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [days, setDays] = useState(30);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [openDrawerId, setOpenDrawerId] = useState<number | null>(null);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  // Fetch Rooms, Reservations, and Customers
  const fetchData = async () => {
    try {
      const roomRes = await axios.get(`${Url}/Admin/Room/GetAll`);
      const formattedRooms = roomRes.data.map((room: any) => ({
        id: room.id,
        name: `Room ${room.roomNumber} (${room.roomType})`,
      }));
      setResources(formattedRooms);

      const resRes = await axios.get(`${Url}/Admin/Reservation/GetAll`);
      const customersRes = await axios.get(
        `${Url}/Admin/Customer/GetCustomers`
      );
      const customers: Customer[] = customersRes.data;

      // Attach customerName to each reservation
      const reservationsWithNames: Reservation[] = resRes.data.map(
        (r: Reservation) => {
          const customer = customers.find((c) => c.id === r.customerId);
          return {
            ...r,
            customerName: customer ? customer.name : r.customerId.toString(),
          };
        }
      );

      const formattedEvents = reservationsWithNames.map((r) => ({
        id: r.id,
        text: `${r.customerName} (${r.roomType})`,
        start: r.checkInDate,
        end: r.checkOutDate,
        resource: r.roomId,
      }));

      setReservations(reservationsWithNames);
      setEvents(formattedEvents);

      // Adjust timeline days
      if (formattedEvents.length > 0) {
        const furthest = new Date(
          Math.max(
            ...formattedEvents.map((r: any) => new Date(r.end).getTime())
          )
        );
        const today = new Date();
        const diffDays = Math.ceil(
          (furthest.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        setDays(diffDays + 5); 
      } else {
        setDays(30); 
      }
    } catch (err: any) {
      ErrorToast(err.message || "Error fetching data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEventClick = (args: any) => {
    const clicked = reservations.find((r) => r.id === args.e.data.id);
    if (!clicked) return;

    setSelectedReservation(clicked);
    setOpenDrawerId(clicked.id);
  };

  return (
    <>
      <Header />
      <Toaster />
     <div className="flex justify-center mt-6">
  <div style={{ width: "1000px", height: `${resources.length * 40}px` }}>
    <DayPilotScheduler
  startDate={DayPilot.Date.today()}
  days={days}
  scale="Day"
  timeHeaders={[
    { groupBy: "Month" },
    { groupBy: "Day", format: "d" },
  ]}
  resources={resources}
  events={events}
  rowMarginBottom={20}
  onEventClick={handleEventClick}
/>

  </div>
</div>

      {selectedReservation && (
        <Drawer
          open={openDrawerId === selectedReservation.id}
          onOpenChange={(open) =>
            setOpenDrawerId(open ? selectedReservation.id : null)
          }
        >
          <DrawerContent>
            <div className="mx-auto w-full max-w-sm">
              <DrawerHeader>
                <DrawerTitle>Reservation Details</DrawerTitle>
                <DrawerDescription>
                  Full details for Reservation #{selectedReservation.id}
                </DrawerDescription>
              </DrawerHeader>

              <div className="p-4 pb-0 space-y-2">
                <p>Customer: {selectedReservation.customerName}</p>
                <p>Room ID: {selectedReservation.roomId}</p>
                <p>Room Type: {selectedReservation.roomType}</p>
                <p>
                  Check-in:{" "}
                  {new Date(selectedReservation.checkInDate).toLocaleString()}
                </p>
                <p>
                  Check-out:{" "}
                  {new Date(selectedReservation.checkOutDate).toLocaleString()}
                </p>
                <p>Adults: {selectedReservation.numberOfAdults}</p>
                <p>Children: {selectedReservation.numberOfChildren}</p>
                <p>Extra Beds: {selectedReservation.numberOfExtraBeds}</p>
              </div>

              <DrawerFooter className="flex justify-between">
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>

                <Popup
                  {...{
                    ...createData(
                      selectedReservation.id,
                      selectedReservation.customerName!
                    ),
                    id: selectedReservation.id.toString(),
                  }}
                  onDeleted={() => {
                    setOpenDrawerId(null);
                    setReservations((prev) =>
                      prev.filter((r) => r.id !== selectedReservation.id)
                    );
                    setEvents((prev) =>
                      prev.filter((ev) => ev.id !== selectedReservation.id)
                    );
                    toast.success("Reservation deleted successfully!");
                  }}
                />
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
}
