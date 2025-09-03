"use client";
import axiosInstance from "@/AxiosInstance.tsx";
import Header from "@/components/Header/Header";
import { parseTokenRoleAndUser } from "@/components/Header/Nav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ErrorToast from "@/Toasts/ErrorToast";
import axios from "axios";
import Cookies from "js-cookie";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Url } from "../../GlobalVariables";

type Reservation = {
  id: number;
  customerId: number;
  roomId: number;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  paid: number;
  dues: number;
  proofOfPayment: string;
  status: string;
  discount: number;
  numberOfAdults: number;
  numberOfChildren: number;
  numberOfExtraBeds: number;
};

export default function CheckoutListPage() {
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    useEffect(() => {
      const token = Cookies.get("token");
      const { role } = parseTokenRoleAndUser(token);

      if (!(role === "Admin" || role === "Receptionist")) {
        navigate("/login");
      }
    }, []);
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `${Url}/Admin/CheckOut/GetCheckOutToday`
        );
        setReservations(response.data || []);
      } catch (err: any) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          ErrorToast("No reservations found for today.");
        } else {
          ErrorToast(
            err.message || "Something went wrong while fetching checkouts"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case "Checked-In":
        return "bg-emerald-600 text-emerald-50";
      case "Reserved":
        return "bg-yellow-500 text-black";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <>
      <Header />
      <Toaster richColors />
      <div className="p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center">Checkouts Today</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="border rounded-xl p-4 shadow space-y-2 animate-pulse"
              >
                <div className="h-6 w-3/4 bg-gray-300 rounded" />
                <div className="h-4 w-1/2 bg-gray-300 rounded" />
                <div className="h-10 w-full bg-gray-300 rounded" />
              </div>
            ))
          ) : reservations.length === 0 ? (
            <p className="text-center text-lg text-gray-500 col-span-full">
              No checkouts today.
            </p>
          ) : (
            reservations.map((reservation) => (
              <Accordion
                type="single"
                collapsible
                key={reservation.id}
                className="border rounded-xl shadow transition"
              >
                <AccordionItem
                  value={`res-${reservation.id}`}
                  className="hover:bg-gray-300/30 rounded-xl"
                >
                  <AccordionTrigger className="p-4 cursor-pointer">
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <h2 className="text-xl font-bold">
                          Reservation #{reservation.id}
                        </h2>
                        <Badge
                          className={`text-sm mt-1 ${getStatusBadgeClasses(
                            reservation.status
                          )}`}
                        >
                          {reservation.status}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          Room: {reservation.roomType} (#{reservation.roomId})
                        </p>
                        <p className="text-sm font-semibold">
                          Check-In:{" "}
                          {new Date(
                            reservation.checkInDate
                          ).toLocaleDateString()}
                        </p>
                        <p className="text-sm font-semibold">
                          Check-Out:{" "}
                          {new Date(
                            reservation.checkOutDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="m-4 mb-0 flex flex-col gap-4">
                    <p>Adults: {reservation.numberOfAdults}</p>
                    <p>Children: {reservation.numberOfChildren}</p>
                    <p>Extra Beds: {reservation.numberOfExtraBeds}</p>
                    <p>Paid: ${reservation.paid}</p>
                    <p>Dues: ${reservation.dues}</p>
                    <Button
                      className="w-full"
                      onClick={() =>
                        navigate(`/checkout/${reservation.id}`, {
                          state: { reservation },
                        })
                      }
                    >
                      Checkout
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))
          )}
        </div>
      </div>
    </>
  );
}
