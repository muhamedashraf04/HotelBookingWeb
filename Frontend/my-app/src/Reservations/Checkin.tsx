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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

function Checkin() {
  useEffect(() => {
    const token = Cookies.get("token");
    const { role } = parseTokenRoleAndUser(token);

    if (!(role === "Admin" || role === "Receptionist")) {
      navigate("/login");
    }
  }, []);
  const [loading, setLoading] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(
          `${Url}/Admin/Checkin/GetToday`
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
        <h1 className="text-2xl font-bold text-center">Today’s Reservations</h1>

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
              No reservations found for today.
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

                    {/* File Upload with Validation */}
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Upload Proof of Payment
                      </label>
                      <input
                        type="file"
                        accept={allowedTypes.join(",")}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          // Validate type
                          if (!allowedTypes.includes(file.type)) {
                            ErrorToast(
                              "Invalid file type. Please upload JPG, PNG, GIF, or WebP."
                            );
                            e.target.value = "";
                            return;
                          }

                          // Validate size
                          if (file.size > MAX_FILE_SIZE) {
                            ErrorToast("File size exceeds 5 MB limit.");
                            e.target.value = "";
                            return;
                          }

                          // ✅ File valid → send to backend
                          const formData = new FormData();
                          formData.append("file", file);
                          formData.append(
                            "reservationId",
                            reservation.id.toString()
                          );

                          axiosInstance
                            .post(
                              `${Url}/Admin/Checkin/UploadProof`,
                              formData,
                              {
                                headers: {
                                  "Content-Type": "multipart/form-data",
                                },
                              }
                            )
                            .then(() => {
                              console.log("Uploaded successfully!");
                            })
                            .catch((err) => {
                              ErrorToast(
                                err.message || "Failed to upload file"
                              );
                            });
                        }}
                        className="block w-full border rounded-md p-2"
                      />
                    </div>

                    <Button
                      className="w-full"
                      disabled={reservation.status === "Checked-In"}
                      onClick={() => {
                        navigate(`/checkin/${reservation.id}`, {
                          state: { reservation },
                        });
                      }}
                    >
                      {reservation.status === "Checked-In"
                        ? "Already Checked-In"
                        : "Check In"}
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

export default Checkin;
