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
import { useNavigate } from "react-router-dom";

type Room = {
  id: number;
  roomNumber: string;
  floor: number;
  capacity: number;
  roomType: string;
  isAvailable: boolean;
};

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
const SearchReservations = () => {
  const [checkInDate, setCheckInDate] = React.useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = React.useState<Date | undefined>();
  const [checkInOpen, setCheckInOpen] = React.useState(false);
  const [checkOutOpen, setCheckOutOpen] = React.useState(false);

  const [checkInTime, setCheckInTime] = React.useState("12:00");
  const [checkOutTime, setCheckOutTime] = React.useState("12:00");

  const [roomType, setRoomType] = React.useState<string>("");
  const [roomTypeOpen, setRoomTypeOpen] = React.useState(false);

  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const searchAvailableRooms = async () => {
    if (
      !checkInDate ||
      !checkOutDate ||
      !checkInTime ||
      !checkOutTime ||
      !roomType
    ) {
      toast.error(
        "Please select all fields: check-in/out date & time, and room type."
      );
      return;
    }

    // Parse the local time string (e.g., "12:00")
    const [checkInHours, checkInMinutes] = checkInTime.split(":").map(Number);
    const [checkOutHours, checkOutMinutes] = checkOutTime
      .split(":")
      .map(Number);

    // Create UTC Date objects using Date.UTC()
    const checkInUTC = new Date(
      Date.UTC(
        checkInDate.getFullYear(),
        checkInDate.getMonth(),
        checkInDate.getDate(),
        checkInHours,
        checkInMinutes,
        0 // seconds
      )
    );

    const checkOutUTC = new Date(
      Date.UTC(
        checkOutDate.getFullYear(),
        checkOutDate.getMonth(),
        checkOutDate.getDate(),
        checkOutHours,
        checkOutMinutes,
        0 // seconds
      )
    );

    const body = {
      checkIn: checkInUTC, // ✅ This date is correctly in UTC
      checkOut: checkOutUTC, // ✅ This date is correctly in UTC
      roomType: roomType,
    };

    setLoading(true);
    try {
      const response = await axios.post(
        `${Url}/Admin/Reservation/Search`,
        body
      );

      if (response.status !== 200) throw new Error("Failed to fetch rooms");

      const data: Room[] = response.data;

      if (data.length === 0) {
        ErrorToast("No available rooms for the selected dates.");
      }

      setRooms(data);
    } catch (err: any) {
      ErrorToast(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const getDateTime = (date: Date | undefined, time: string) => {
    if (!date) {
      ErrorToast("No date provided.");
      return new Date(); // fallback to now
    }
    const [hours, minutes] = time.split(":").map(Number);
    // Create a date in UTC
    const newDate = new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        hours,
        minutes,
        0
      )
    );
    return newDate;
  };
  return (
    <>
      <Header />
      <div className="p-8 space-y-6">
        <Toaster />
        <h1 className="text-2xl font-bold text-center">
          Search Available Rooms
        </h1>

        {/* Inputs in a row */}
        <div className="flex flex-wrap justify-center gap-4 mt-10 mb-10 items-end scale-115">
          {/* Check-in Date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="check-in-date" className="font-semibold ml-1">
              Check-in Date
            </Label>
            <Popover open={checkInOpen} onOpenChange={setCheckInOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="check-in-date"
                  variant="outline"
                  className="w-40 justify-between font-normal"
                >
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
            <Label htmlFor="check-in-time" className="font-semibold ml-1">
              Check-in Time
            </Label>
            <Input
              type="time"
              id="check-in-time"
              value={checkInTime}
              onChange={(e) => setCheckInTime(e.target.value)}
              step="60"
              className="w-32"
            />
          </div>

          {/* Check-out Date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="check-out-date" className="font-semibold ml-1">
              Check-out Date
            </Label>
            <Popover open={checkOutOpen} onOpenChange={setCheckOutOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="check-out-date"
                  variant="outline"
                  className="w-40 justify-between font-normal"
                >
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
            <Label htmlFor="check-out-time" className="font-semibold ml-1">
              Check-out Time
            </Label>
            <Input
              type="time"
              id="check-out-time"
              value={checkOutTime}
              onChange={(e) => setCheckOutTime(e.target.value)}
              step="60"
              className="w-32"
            />
          </div>

          {/* Room Type Combobox */}
          <div className="flex flex-col gap-2 ">
            <Label className="font-semibold ml-1">Room Type</Label>
            <Popover open={roomTypeOpen} onOpenChange={setRoomTypeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={roomTypeOpen}
                  className="w-40 justify-between"
                >
                  {roomType
                    ? roomTypes.find((r) => r.value === roomType)?.label
                    : "Select type"}
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
                          onSelect={(currentValue) => {
                            setRoomType(
                              currentValue === roomType ? "" : currentValue
                            );
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
        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
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
                        <p className="text-xl font-semibold">
                          Floor : {room.floor}
                        </p>
                        <p className="text-xl font-semibold">
                          Capacity : {room.capacity}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="m-4 mb-0 flex flex-col gap-4">
                    <Button
                      className={`w-full ${
                        room.isAvailable
                          ? "cursor-pointer"
                          : "cursor-not-allowed"
                      }`}
                      onClick={() => {
                        toast.loading(`Booking Room ${room.roomNumber}`);
                        navigate("/reservations/booking", {
                          state: {
                            checkIn: getDateTime(checkInDate, checkInTime),
                            checkOut: getDateTime(checkOutDate, checkOutTime),
                            roomType: roomType,
                            roomNumber: room.roomNumber,
                            roomId: room.id,
                          },
                        });
                      }}
                      disabled={!room.isAvailable}
                    >
                      {room.isAvailable ? "Book Now" : "Unavailable"}
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

export default SearchReservations;
