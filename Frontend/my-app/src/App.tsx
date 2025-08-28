"use client";

import Header from "@/components/Header/Header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { DayPilot, DayPilotScheduler } from "@daypilot/daypilot-lite-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { Url } from "../GlobalVariables";
import ErrorToast from "../src/Toasts/ErrorToast";
import "../styles/defaultschedule.css";

type Reservation = {
  id: number;
  customerId: number;
  customerName?: string;
  roomId: number;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfExtraBeds: number;
  status: string;
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
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [openDrawerId, setOpenDrawerId] = useState<number | null>(null);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] =
    useState<Reservation | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    reservation: Reservation | null;
  } | null>(null);

  const fetchData = async () => {
    try {
      const roomRes = await axios.get(`${Url}/Admin/Room/GetAll`);
      const formattedRooms = roomRes.data.map((room: any) => ({
        id: room.id,
        name: `${room.roomNumber} (${room.roomType})`,
      }));
      setResources(formattedRooms);

      const resRes = await axios.get(`${Url}/Admin/Reservation/GetAll`);
      const customersRes = await axios.get(
        `${Url}/Admin/Customer/GetCustomers`
      );
      const customers: Customer[] = customersRes.data;

      const reservationsWithNames: Reservation[] = resRes.data.map(
        (r: Reservation) => {
          const customer = customers.find((c) => c.id === r.customerId);
          return {
            ...r,
            customerName: customer ? customer.name : r.customerId.toString(),
          };
        }
      );

      const formattedEvents = reservationsWithNames.map((r) => {
        let cssClass = "";

        if (r.status === "Checked-In") {
          cssClass = "checkedin-event";
        } else if (r.status === "Reserved") {
          cssClass = "reserved-event";
        } else if (r.status === "Checked-Out") {
          cssClass = "checkout-event";
        }

        return {
          id: r.id,
          text: `${r.customerName} (${r.roomType})`,
          start: r.checkInDate,
          end: r.checkOutDate,
          resource: r.roomId,
          cssClass, // ✅ this links to your CSS
        };
      });

      setReservations(reservationsWithNames);
      setEvents(formattedEvents);

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
        setDays(Math.max(diffDays, 25) + 5);
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

  useEffect(() => {
    const disableContextMenu = (e: MouseEvent) => {
      if (contextMenu) e.preventDefault();
    };
    window.addEventListener("contextmenu", disableContextMenu);
    return () => window.removeEventListener("contextmenu", disableContextMenu);
  }, [contextMenu]);

  const handleEventClick = (args: any) => {
    const clicked = reservations.find((r) => r.id === args.e.data.id);
    if (!clicked) return;
    setSelectedReservation(clicked);
    setOpenDrawerId(clicked.id);
  };

  const handleDeleteClick = (reservation: Reservation) => {
    setReservationToDelete(reservation);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!reservationToDelete) return;

    try {
      // Call your API to delete the reservation
      const response = await axios.delete(
        `${Url}/Admin/Reservation/Delete?id=${reservationToDelete.id}`
      );

      if (response.status === 200) {
        // Show success message
        toast.success(
          `Reservation for ${reservationToDelete.customerName} has been deleted successfully.`
        );

        // Refresh the data
        fetchData();
      } else {
        ErrorToast("Failed to delete reservation");
      }
    } catch (err: any) {
      if (err.response?.status === 400) {
        ErrorToast("Invalid reservation ID");
      } else if (err.response?.status === 404) {
        ErrorToast("Reservation not found");
      } else {
        ErrorToast(err.message || "Error deleting reservation");
      }
    } finally {
      // Close the dialog
      setDeleteDialogOpen(false);
      setReservationToDelete(null);
    }
  };

  return (
    <>
      <Header />
      <Toaster richColors />
      <div className="flex justify-center mt-6">
        <div style={{ width: "1000px", height: `${resources.length * 40}px` }}>
          <DayPilotScheduler
            onEventRightClick={(args) => {
              args.originalEvent.preventDefault();
              const clicked = reservations.find((r) => r.id === args.e.data.id);
              if (!clicked) return;
              setContextMenu({
                x: args.originalEvent.clientX,
                y: args.originalEvent.clientY,
                reservation: clicked,
              });
            }}
            startDate={DayPilot.Date.today().addDays(-7)}
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
            eventMoveHandling="Disabled"
            eventResizeHandling="Disabled"
            theme="defaultschedule"
          />
        </div>
      </div>

      {contextMenu && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            background: "white",
            border: "1px solid #ccc",
            borderRadius: "6px",
            boxShadow: "0px 2px 6px rgba(0,0,0,0.2)",
            zIndex: 9999,
          }}
          onMouseLeave={() => setContextMenu(null)}
        >
          <button
            className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-green-600"
            onClick={() => {
              navigate(`/CheckIn/${contextMenu.reservation!.id}`, {
                state: contextMenu.reservation,
              });
            }}
          >
            ✅ Check-In
          </button>
          <button
            className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600"
            onClick={() => {
              navigate(`/CheckOut/${contextMenu.reservation!.id}`, {
                state: contextMenu.reservation,
              });
            }}
          >
            ⬜ Check-Out
          </button>
          <button
            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
            onClick={() => {
              navigate(`/reservation/edit/${contextMenu.reservation!.id}`, {
                state: contextMenu.reservation,
              });
              setContextMenu(null);
            }}
          >
            ✏️ Edit
          </button>
          <button
            className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600"
            onClick={() => {
              handleDeleteClick(contextMenu.reservation!);
              setContextMenu(null);
            }}
          >
            🗑️ Delete
          </button>
        </div>
      )}

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

              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </div>
          </DrawerContent>
        </Drawer>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {reservationToDelete
                ? `This will permanently delete the reservation for ${reservationToDelete.customerName}. This action cannot be undone.`
                : "This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
