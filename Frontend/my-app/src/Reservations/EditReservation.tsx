"use client";

import Header from "@/components/Header/Header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { Check, ChevronDownIcon, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { toast, Toaster } from "sonner";
import { Url } from "../../GlobalVariables.tsx";

import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ErrorToast from "@/Toasts/ErrorToast.tsx";
import { useLocation, useNavigate, useParams } from "react-router-dom";

type Room = {
  id: number;
  roomNumber: string;
  floor: number;
  capacity: number;
  roomType: string;
};

interface ReservationUpdateDto {
  Id: number;
  CheckInDate: string;
  CheckOutDate: string;
  roomId: number;
  ReservationId?: number;
}

const roomTypes = [
  { value: "Single", label: "Single" },
  { value: "Double", label: "Double" },
  { value: "Suite", label: "Suite" },
];

const getRoomBadgeClasses = (type: string) => {
  switch (type) {
    case "Double":
      return "bg-emerald-600 text-emerald-50";
    case "Suite":
      return "bg-cyan-800 text-cyan-50";
    default:
      return "bg-emerald-100 text-emerald-950";
  }
};

const EditReservation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const reservationState = location.state as any;
  const [checkInDate, setCheckInDate] = React.useState<Date | undefined>(
    reservationState ? new Date(reservationState.checkInDate) : undefined
  );
  const [checkOutDate, setCheckOutDate] = React.useState<Date | undefined>(
    reservationState ? new Date(reservationState.checkOutDate) : undefined
  );
  const [checkInOpen, setCheckInOpen] = React.useState(false);
  const [checkOutOpen, setCheckOutOpen] = React.useState(false);

  const [checkInTime, setCheckInTime] = React.useState(
    reservationState
      ? new Date(reservationState.checkInDate).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "12:00"
  );
  const formatDateTimeLocal = (date: Date | string | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const [checkOutTime, setCheckOutTime] = React.useState(
    reservationState
      ? new Date(reservationState.checkOutDate).toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "12:00"
  );

  const [roomType, setRoomType] = React.useState<string>(
    reservationState?.roomType || ""
  );
  const [roomTypeOpen, setRoomTypeOpen] = React.useState(false);

  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [loading, setLoading] = React.useState(false);

  const searchAvailableRooms = async () => {
    if (
      !checkInDate ||
      !checkOutDate ||
      !checkInTime ||
      !checkOutTime ||
      !roomType
    ) {
      toast.error("Please select all fields before searching.");
      return;
    }

    const body = {
      CheckInDate: formatDateTimeLocal(
        `${checkInDate.toDateString()} ${checkInTime}`
      ),
      CheckOutDate: formatDateTimeLocal(
        `${checkOutDate.toDateString()} ${checkOutTime}`
      ),
      roomType: roomType,
      reservationId: Number(id),
    };

    setLoading(true);
    try {
      const response = await axios.post(
        `${Url}/Admin/Reservation/Search`,
        body
      );
      if (response.status !== 200) throw new Error("Failed to fetch rooms");
      const data: Room[] = response.data;
      if (data.length === 0)
        ErrorToast("No available rooms for the selected dates.");
      setRooms(data);
    } catch (err: any) {
      ErrorToast(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const updateReservation = async (room: Room) => {
    try {
      const dto: ReservationUpdateDto = {
        Id: Number(id),
        CheckInDate: formatDateTimeLocal(
          `${checkInDate?.toDateString()} ${checkInTime}`
        ),
        CheckOutDate: formatDateTimeLocal(
          `${checkOutDate?.toDateString()} ${checkOutTime}`
        ),
        roomId: room.id,
      };
      console.log("Checkin: " + dto.CheckInDate);

      console.log("Checkin: " + dto.CheckOutDate);
      await axios.post(`${Url}/Admin/Reservation/Edit`, dto);

      toast.success(`Reservation updated for Room ${room.roomNumber}`);

      // Delay redirect so user can see the toast
      setTimeout(() => {
        navigate("/"); // redirect to App.tsx root
      }, 1500);
    } catch (err: any) {
      ErrorToast(
        err.response?.data || err.message || "Failed to update reservation."
      );
    }
  };

  return (
    <>
      <Header />
      <div className="p-8 space-y-6">
        <Toaster richColors />{" "}
        <h1 className="text-2xl font-bold text-center">Edit Reservation</h1>
        {/* Date, Time, Room Type selection & Search */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 items-end">
          {/* Check-in Date */}
          <div className="flex flex-col gap-2">
            <Label>Check-in Date</Label>
            <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-40 justify-between">
                  {checkInDate
                    ? checkInDate.toLocaleDateString()
                    : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={checkInDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setCheckInDate(date);
                    setCheckOutDate(undefined);
                    setCheckInOpen(false);
                  }}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Check-in Time */}
          <div className="flex flex-col gap-2">
            <Label>Check-in Time</Label>
            <Input
              type="time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              className="w-32"
            />
          </div>

          {/* Check-out Date */}
          <div className="flex flex-col gap-2">
            <Label>Check-out Date</Label>
            <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-40 justify-between">
                  {checkOutDate
                    ? checkOutDate.toLocaleDateString()
                    : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={checkOutDate}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setCheckOutDate(date);
                    setCheckOutOpen(false);
                  }}
                  disabled={(date) => {
                    if (!checkInDate) return true; // disable all until check-in is chosen

                    const minDate = new Date(checkInDate);
                    minDate.setDate(minDate.getDate() + 1); // check-out must be at least next day

                    return date < minDate; // disable anything before minDate
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Check-out Time */}
          <div className="flex flex-col gap-2">
            <Label>Check-out Time</Label>
            <Input
              type="time"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              className="w-32"
            />
          </div>

          {/* Room Type */}
          <div className="flex flex-col gap-2">
            <Label>Room Type</Label>
            <Popover open={roomTypeOpen} onOpenChange={setRoomTypeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={roomTypeOpen}
                  className="w-40 justify-between"
                >
                  {roomType || "Select type"}{" "}
                  <ChevronsUpDown className="opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-0">
                <Command>
                  <CommandInput placeholder="Search type..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>No type found.</CommandEmpty>
                    <CommandGroup>
                      {roomTypes.map((r) => (
                        <CommandItem
                          key={r.value}
                          value={r.value}
                          onSelect={(val) => {
                            setRoomType(val === roomType ? "" : val);
                            setRoomTypeOpen(false);
                          }}
                        >
                          {r.label}
                          <Check
                            className={cn(
                              "ml-auto",
                              roomType === r.value ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-end">
            <Button
              className="h-10 cursor-pointer"
              onClick={searchAvailableRooms}
            >
              Search
            </Button>
          </div>
        </div>
        {/* Rooms List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="border rounded-xl p-4 shadow space-y-2 animate-pulse"
              >
                <div className="h-6 w-3/4 bg-gray-300 rounded" />
                <div className="h-4 w-1/2 bg-gray-300 rounded" />
                <div className="h-10 w-full bg-gray-300 rounded" />
              </div>
            ))
          ) : rooms.length === 0 ? (
            <p className="text-center text-lg text-gray-500 col-span-full">
              No available rooms for the selected dates.
            </p>
          ) : (
            rooms.map((room) => (
              <Accordion
                type="single"
                collapsible
                key={room.roomNumber}
                className="border rounded-xl shadow transition"
              >
                <AccordionItem value={`room-${room.roomNumber}`}>
                  <AccordionTrigger className="p-4">
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {room.roomNumber}
                        </h2>
                        <Badge
                          className={`text-lg mt-1 ${getRoomBadgeClasses(
                            room.roomType
                          )}`}
                        >
                          {room.roomType}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xl">Floor: {room.floor}</p>
                        <p className="text-xl">Capacity: {room.capacity}</p>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="mt-4 flex flex-col gap-4">
                    <Button
                      className={`w-full ${"cursor-pointer"}`}
                      onClick={() => updateReservation(room)}
                    >
                      Update Reservation
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
};

export default EditReservation;
