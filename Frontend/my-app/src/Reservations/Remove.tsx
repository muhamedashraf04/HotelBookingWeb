"use client";
import axiosInstance from "@/AxiosInstance.tsx";
import Header from "@/components/Header/Header";
import { parseTokenRoleAndUser } from "@/components/Header/Nav";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import Cookies from "js-cookie";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { Url } from "../../GlobalVariables";
import DeletePopup from "../DeletePopup";

type Reservation = {
  id: number;
  customerId: number;
  roomId: number;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfExtraBeds: number;
};

const RemoveReservation = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = Cookies.get("token");
    const { role } = parseTokenRoleAndUser(token);

    if (!(role === "Admin" || role === "Receptionist")) {
      navigate("/login");
    }
  }, []);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDrawerId, setOpenDrawerId] = useState<number | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const reservation = await axiosInstance.get(
          `${Url}/Admin/Reservation/GetAll`
        );
        if (reservation.status != 200)
          throw new Error("Failed to fetch reservations");
        const data: Reservation[] = await reservation.data;
        setReservations(data);
      } catch (err: any) {
        toast.error(err.message || "Error fetching reservations");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const skeletons = Array.from({ length: 6 });

  return (
    <>
      <Header />
      <div className="p-8">
        <Toaster />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading
            ? skeletons.map((_, idx) => (
                <div
                  key={idx}
                  className="border rounded-xl p-4 shadow space-y-2"
                >
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))
            : reservations.map((reservation) => (
                <Drawer
                  key={reservation.id}
                  open={openDrawerId == reservation.id}
                  onOpenChange={(open) =>
                    setOpenDrawerId(open ? reservation.id : null)
                  }
                >
                  <DrawerTrigger asChild>
                    <div className="border rounded-xl p-4 shadow hover:shadow-lg cursor-pointer transition">
                      <h2 className="text-xl font-bold">
                        Reservation #{reservation.id}
                      </h2>
                      <p>Room Type: {reservation.roomType}</p>
                      <p>
                        Check-in:{" "}
                        {new Date(reservation.checkInDate).toLocaleString()}
                      </p>
                      <p>
                        Check-out:{" "}
                        {new Date(reservation.checkOutDate).toLocaleString()}
                      </p>
                    </div>
                  </DrawerTrigger>

                  <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                      <DrawerHeader>
                        <DrawerTitle>Reservation Details</DrawerTitle>
                        <DrawerDescription>
                          Full details for Reservation #{reservation.id}
                        </DrawerDescription>
                      </DrawerHeader>

                      <div className="p-4 pb-0 space-y-2">
                        <p>Customer ID: {reservation.customerId}</p>
                        <p>Room ID: {reservation.roomId}</p>
                        <p>Room Type: {reservation.roomType}</p>
                        <p>
                          Check-in:{" "}
                          {new Date(reservation.checkInDate).toLocaleString()}
                        </p>
                        <p>
                          Check-out:{" "}
                          {new Date(reservation.checkOutDate).toLocaleString()}
                        </p>
                        <p>Adults: {reservation.numberOfAdults}</p>
                        <p>Children: {reservation.numberOfChildren}</p>
                        <p>Extra Beds: {reservation.numberOfExtraBeds}</p>
                      </div>

                      <DrawerFooter className="flex justify-between">
                        <DrawerClose asChild>
                          <Button variant="outline" className="cursor-pointer">
                            Close
                          </Button>
                        </DrawerClose>
                        <DeletePopup
                          Controller="Reservation"
                          Action="Remove"
                          Area="Admin"
                          id={`${reservation.id}`}
                          message={`This will permanently delete Reservation #${reservation.id}. This action cannot be undone.`}
                          onDeleted={() => {
                            setOpenDrawerId(null);
                            setReservations((prev) =>
                              prev.filter((r) => r.id !== reservation.id)
                            );
                          }}
                        />
                      </DrawerFooter>
                    </div>
                  </DrawerContent>
                </Drawer>
              ))}
        </div>
      </div>
    </>
  );
};

export default RemoveReservation;
