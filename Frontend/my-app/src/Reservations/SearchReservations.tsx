"use client";
import Cookies from "js-cookie";

import Header from "@/components/Header/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ErrorToast from "@/Toasts/ErrorToast.tsx";
import axios from "axios";
import { Check, ChevronDownIcon, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { Url } from "../../GlobalVariables.tsx";
import Schedule from "../Schedule/Schedule.tsx";

type Room = {
  id: number;
  roomNumber: string;
  images: string;
  floor: number;
  capacity: number;
  roomType: string;
  price: number;
};

type RoomType = {
  value: string;
  label: string;
};
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

type Rate = {
  id?: number;
  type: string;
  price: number;
  badgeBg?: string;
  badgeText?: string;
};

const DEFAULT_BADGE_BG = "#e5e7eb";
const DEFAULT_BADGE_FG = "#1f2937";

const SearchReservations = () => {
  const [checkInDate, setCheckInDate] = React.useState<Date | undefined>();
  const [checkOutDate, setCheckOutDate] = React.useState<Date | undefined>();
  const [checkInOpen, setCheckInOpen] = React.useState(false);
  const [checkOutOpen, setCheckOutOpen] = React.useState(false);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  const [checkInTime, setCheckInTime] = React.useState("12:00");
  const [checkOutTime, setCheckOutTime] = React.useState("12:00");

  const [roomType, setRoomType] = React.useState<string>("");
  const [roomTypeOpen, setRoomTypeOpen] = React.useState(false);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [openDrawerId, setOpenDrawerId] = useState<number | null>(null);
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [resources, setResources] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [days, setDays] = useState(30);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  const navigate = useNavigate();

  const [rateColors, setRateColors] = useState<
    Record<string, { bg: string; fg: string }>
  >({});

  useEffect(() => {
    const loadRateColors = async () => {
      try {
        const res = await axios.get(`${Url}/Admin/Rate/GetAll`);
        const rates = (res.data as Rate[]) ?? [];
        const map: Record<string, { bg: string; fg: string }> = {};
        for (const r of rates) {
          map[r.type] = {
            bg: r.badgeBg || DEFAULT_BADGE_BG,
            fg: r.badgeText || DEFAULT_BADGE_FG,
          };
        }
        setRateColors(map);
      } catch (_) {
        // هيتصرف بالـdefaults لو فشل
      }
    };
    loadRateColors();
  }, []);
  const getTypeColors = (type: string) =>
    rateColors[type] ?? { bg: DEFAULT_BADGE_BG, fg: DEFAULT_BADGE_FG };

  // set axios auth header from cookie once on mount
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
    fetchRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load rates
  const fetchRates = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${Url}/Admin/Rate/GetAll`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`, // if your endpoint requires auth
        },
      });
      if (res.status !== 200) throw new Error("Failed to fetch rates");

      // map API data into {value,label}
      const formatted: RoomType[] = res.data.map((rate: any) => ({
        value: rate.id?.toString() ?? rate.name,
        label: rate.name ?? rate.type,
      }));

      setRoomTypes(formatted);
    } catch (err: any) {
      ErrorToast(err?.message || "Could not load rates");
    } finally {
      setLoading(false);
    }
  };

  const searchAvailableRooms = async () => {
    if (!checkInDate) {
      toast.error("Please select a check-in date.");
      return;
    }
    if (!checkOutDate) {
      toast.error("Please select a check-out date.");
      return;
    }
    if (!checkInTime) {
      toast.error("Please select a check-in time.");
      return;
    }
    if (!checkOutTime) {
      toast.error("Please select a check-out time.");
      return;
    }
    if (!roomType) {
      toast.error("Please select a room type.");
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
        0
      )
    );

    const checkOutUTC = new Date(
      Date.UTC(
        checkOutDate.getFullYear(),
        checkOutDate.getMonth(),
        checkOutDate.getDate(),
        checkOutHours,
        checkOutMinutes,
        0
      )
    );

    const body = {
      checkInDate: checkInUTC,
      checkOutDate: checkOutUTC,
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
      const data: Room[] = [];
      setRooms(data);
    } finally {
      setLoading(false);
    }
  };
  const handleEventClick = (args: any) => {
    const clicked = reservations.find((r) => r.id === args.e.data.id);
    if (!clicked) return;
    setSelectedReservation(clicked);
    setOpenDrawerId(clicked.id);
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
        if (r.status === "Checked-In") cssClass = "checkedin-event";
        else if (r.status === "Reserved") cssClass = "reserved-event";
        else if (r.status === "Checked-Out") cssClass = "checkout-event";

        return {
          id: r.id,
          text: `${r.customerName} (${r.roomType})`,
          start: r.checkInDate,
          end: r.checkOutDate,
          resource: r.roomId,
          cssClass,
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
      toast.error(err.message || "Error fetching data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const filteredResources = roomType
    ? resources.filter((r) => r.name.includes(`(${roomType})`))
    : resources;

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
          <div className="flex flex-col gap-2">
            <Label className="font-semibold ml-1">Room Type</Label>
            <Popover open={roomTypeOpen} onOpenChange={setRoomTypeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={roomTypeOpen}
                  className="w-40 justify-between"
                >
                  {roomType || "Select type"}
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
                          value={r.label}
                          onSelect={() => {
                            setRoomType(r.label); // ✅ always store label
                            setRoomTypeOpen(false);
                          }}
                        >
                          {r.label}
                          <Check
                            className={cn(
                              "ml-auto",
                              roomType === r.label ? "opacity-100" : "opacity-0"
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

        <div className="grid md:grid-cols-10 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="border rounded-xl shadow cursor-pointer hover:bg-muted/30 flex items-center justify-center"
              onClick={() => {
                setSelectedRoom(room);
                setOpenDrawerId(room.id);
                console.log("Selected room:", room);
              }}
            >
              {/* Centered Content */}
              <div className="flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold mb-2 text-center">
                  {room.roomNumber}
                </h2>
                {(() => {
                  const c = getTypeColors(room.roomType);
                  return (
                    <Badge
                      className="text-lg"
                      style={{
                        backgroundColor: c.bg,
                        color: c.fg,
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}
                      title={`${room.roomType} (${c.bg} / ${c.fg})`}
                    >
                      {room.roomType}
                    </Badge>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
        <hr className="my-15 border-t border-grey-200 w-full border-3" />
        <div className="flex justify-center mt-10">
          <div
            style={{
              width: "1000px",
              height: `${resources.length * 40}px`,
            }}
          >
            <Schedule
              resources={filteredResources}
              events={events.filter((e) =>
                !roomType ? true : e.text.includes(`(${roomType})`)
              )}
              days={days}
              onEventClick={handleEventClick}
              onEventRightClick={() => {}}
            />
          </div>
        </div>
        {/* Drawer */}
        {selectedRoom && (
          <Drawer
            open={openDrawerId === selectedRoom.id}
            onOpenChange={(open) =>
              setOpenDrawerId(open ? selectedRoom.id : null)
            }
          >
            <DrawerContent className="max-w-full mx-auto rounded-t-2xl shadow-xl">
              <div className="mx-auto w-full max-w-full grid-cols-2">
                {/* Header */}
                <DrawerHeader className="border-b pb-4">
                  <DrawerTitle className="text-2xl font-bold">
                    Room Details
                  </DrawerTitle>
                  <DrawerDescription className="text-muted-foreground">
                    Full details for Room #{selectedRoom.roomNumber}
                  </DrawerDescription>
                </DrawerHeader>
                {/* Body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  {/* Image Carousel */}
                  <div className="flex items-center justify-center">
                    {selectedRoom.images ? (
                      <Carousel className="w-full max-w-lg">
                        <CarouselContent>
                          {(Array.isArray(selectedRoom.images)
                            ? selectedRoom.images
                            : selectedRoom.images.split(",")
                          )
                            .map((img) => img.trim())
                            .filter((img) => img.length > 0)
                            .map((src, index) => (
                              <CarouselItem key={index}>
                                <div className="p-1 flex items-center justify-center">
                                  <img
                                    src={src}
                                    alt={`Room image ${index + 1}`}
                                    className="w-full h-[380px] object-contain rounded-xl shadow-md"
                                  />
                                </div>
                              </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious />
                        <CarouselNext />
                      </Carousel>
                    ) : (
                      <p className="text-center text-muted-foreground">
                        No images available.
                      </p>
                    )}
                  </div>

                  {/* Divider + Text */}
                  <div className="flex flex-col md:flex-row items-center w-full">
                    {/* Taller vertical divider */}
                    <div className="hidden md:block w-px bg-gray-300 mx-6 h-full"></div>

                    {/* Text Details */}
                    <div className="space-y-2 text-2xl flex-1 font-[inter]">
                      <p className="font-extrabold text-5xl mt-0 mb-25">
                        {selectedRoom.roomNumber}
                      </p>
                      <p>
                        <span className="font-bold">Type:</span>{" "}
                        {selectedRoom.roomType}
                      </p>
                      <p>
                        <span className="font-bold">Floor:</span>{" "}
                        {selectedRoom.floor}
                      </p>
                      <p>
                        <span className="font-bold">Capacity:</span>{" "}
                        {selectedRoom.capacity}
                      </p>
                      <p>
                        <span className="font-bold">Price per night:</span>{" "}
                        {selectedRoom.price} EGP
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <DrawerFooter className="flex flex-col md:flex-row items-center justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                  <DrawerClose asChild>
                    <Button variant="outline" className="flex-1 px-6 py-2">
                      Close
                    </Button>
                  </DrawerClose>

                  <Button
                    className={`flex-1 px-6 py-2 font-semibold shadow-sm transition-colors ${"cursor-pointer"}`}
                    onClick={() => {
                      toast.loading(`Booking Room ${selectedRoom.roomNumber}`);
                      navigate("/reservations/booking", {
                        state: {
                          checkIn: getDateTime(checkInDate, checkInTime),
                          checkOut: getDateTime(checkOutDate, checkOutTime),
                          roomType: roomType,
                          roomNumber: selectedRoom.roomNumber,
                          roomId: selectedRoom.id,
                        },
                      });
                    }}
                  >
                    Book Now
                  </Button>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </div>
    </>
  );
};

export default SearchReservations;
