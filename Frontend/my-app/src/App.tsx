"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
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
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/Header/Header";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { ThemeProvider } from "./components/ui/theme-provider";

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

const App = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<
    Reservation | undefined
  >(undefined);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          "http://localhost:5002/Admin/Reservation/GetAll"
        );
        if (!res.ok) throw new Error("Failed to fetch reservations");
        const data: Reservation[] = await res.json();
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
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
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
              : reservations.map((res) => (
                  <Drawer key={res.id}>
                    <DrawerTrigger asChild>
                      <div
                        className="border rounded-xl p-4 shadow hover:shadow-lg cursor-pointer transition"
                        onClick={() => setSelectedReservation(res)}
                      >
                        <h2 className="text-xl font-bold">
                          Reservation #{res.id}
                        </h2>
                        <p>Room Type: {res.roomType}</p>
                        <p>
                          Check-in:{" "}
                          {new Date(res.checkInDate).toLocaleDateString()}
                        </p>
                        <p>
                          Check-out:{" "}
                          {new Date(res.checkOutDate).toLocaleDateString()}
                        </p>
                      </div>
                    </DrawerTrigger>

                    <DrawerContent>
                      <div className="mx-auto w-full max-w-sm">
                        <DrawerHeader>
                          <DrawerTitle>Reservation Details</DrawerTitle>
                          <DrawerDescription>
                            Full details for Reservation #{res.id}
                          </DrawerDescription>
                        </DrawerHeader>

                        <div className="p-4 pb-0 space-y-2">
                          <p>Customer ID: {res.customerId}</p>
                          <p>Room ID: {res.roomId}</p>
                          <p>Room Type: {res.roomType}</p>
                          <p>
                            Check-in:{" "}
                            {new Date(res.checkInDate).toLocaleDateString()}
                          </p>
                          <p>
                            Check-out:{" "}
                            {new Date(res.checkOutDate).toLocaleDateString()}
                          </p>
                          <p>Adults: {res.numberOfAdults}</p>
                          <p>Children: {res.numberOfChildren}</p>
                          <p>Extra Beds: {res.numberOfExtraBeds}</p>
                        </div>

                        <DrawerFooter className="flex justify-between">
                          <DrawerClose asChild>
                            <Button
                              variant="outline"
                              className="cursor-pointer"
                            >
                              Close
                            </Button>
                          </DrawerClose>

                          {/* Delete Button with Confirmation */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button className="bg-red-500 hover:bg-red-600 text-white cursor-pointer">
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete Reservation #
                                  {res.id}. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="cursor-pointer">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="cursor-pointer"
                                  onClick={async () => {
                                    try {
                                      const response = await fetch(
                                        `http://localhost:5002/Admin/Reservation/Remove?id=${res.id}`,
                                        { method: "DELETE" }
                                      );
                                      if (!response.ok)
                                        throw new Error(
                                          "Failed to delete reservation"
                                        );

                                      toast.success(
                                        `Reservation #${res.id} deleted successfully`
                                      );
                                      setReservations((prev) =>
                                        prev.filter((r) => r.id !== res.id)
                                      );
                                    } catch (err: any) {
                                      toast.error(
                                        err.message ||
                                          "Error deleting reservation"
                                      );
                                    }
                                  }}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DrawerFooter>
                      </div>
                    </DrawerContent>
                  </Drawer>
                ))}
          </div>
        </div>
      </>
    </ThemeProvider>
  );
};

export default App;
