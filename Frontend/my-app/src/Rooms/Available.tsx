"use client";

import { Check, ChevronDownIcon, ChevronsUpDown } from "lucide-react";
import * as React from "react";

import Header from "@/Header/Header";
import { Button } from "@/components/ui/button";
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
import { toast, Toaster } from "sonner";

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

const Available = () => {
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

    const body = {
      checkIn: new Date(`${checkInDate.toDateString()} ${checkInTime}`),
      checkOut: new Date(`${checkOutDate.toDateString()} ${checkOutTime}`),
      roomType: roomType,
    };

    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5002/Admin/Reservation/Search",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) throw new Error("Failed to fetch available rooms");
      const data: Room[] = await res.json();
      setRooms(data);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
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
        <div className="flex flex-wrap justify-center gap-4 mt-4 items-end">
          {/* Check-in Date */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="check-in-date">Check-in Date</Label>
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
                    setCheckInOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Check-in Time */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="check-in-time">Check-in Time</Label>
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
            <Label htmlFor="check-out-date">Check-out Date</Label>
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
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Check-out Time */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="check-out-time">Check-out Time</Label>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="border rounded-xl p-4 shadow space-y-2 animate-pulse"
                >
                  <div className="h-6 w-3/4 bg-gray-300 rounded" />
                  <div className="h-4 w-1/2 bg-gray-300 rounded" />
                  <div className="h-4 w-full bg-gray-300 rounded" />
                </div>
              ))
            : rooms.length === 0
            ? "No available rooms for the selected dates."
            : rooms.map((room) => (
                <div
                  key={room.id}
                  className="border rounded-xl p-4 shadow cursor-pointer hover:shadow-lg transition"
                >
                  <h2 className="text-xl font-bold">{room.roomNumber}</h2>
                  <p>Room Type: {room.roomType}</p>
                  <p>Floor: {room.floor}</p>
                  <p>Capacity: {room.capacity}</p>
                  <p>
                    Status: {room.isAvailable ? "Available" : "Unavailable"}
                  </p>
                </div>
              ))}
        </div>
      </div>
    </>
  );
};

export default Available;
