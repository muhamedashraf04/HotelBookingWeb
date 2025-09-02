"use client";

import Header from "@/components/Header/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import DeletePopup from "@/DeletePopup";
import axios from "axios";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { Url } from "../../GlobalVariables.tsx";

// Types
export type Room = {
  id: number;
  roomNumber: string;
  floor: number;
  capacity: number;
  roomType: string;
  price: number;
  images: string;
};

type Rate = {
  id?: number;
  type: string;
  price: number;
  badgeBg?: string; // saved from Rates page (hex)
  badgeText?: string; // saved from Rates page (hex)
};

const ITEMS_PER_PAGE = 70;

// Fallback colors if a rate doesn't have custom colors
const DEFAULT_BADGE_BG = "#e5e7eb"; // gray-200
const DEFAULT_BADGE_FG = "#1f2937"; // gray-800

const AllRooms = () => {
  const navigate = useNavigate();

  // data
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [rateColors, setRateColors] = useState<
    Record<string, { bg: string; fg: string }>
  >({});

  // ui
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [openDrawerId, setOpenDrawerId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [typesLoading, setTypesLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Fetch rooms + rates (with colors)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setTypesLoading(true);
      try {
        const [roomsRes, ratesRes] = await Promise.all([
          axios.get(`${Url}/Admin/Room/GetAll`),
          axios.get(`${Url}/Admin/Rate/GetAll`),
        ]);

        if (roomsRes.status !== 200) throw new Error("Failed to fetch rooms");
        const roomsData = roomsRes.data as Room[];
        setRooms(roomsData);

        const rates = (ratesRes.data as Rate[]) ?? [];

        // Determine type order by price (cheapest first)
        const sortedTypes = [...new Set(rates.map((r) => r.type))].sort(
          (a, b) => {
            const pa = rates.find((r) => r.type === a)?.price ?? 0;
            const pb = rates.find((r) => r.type === b)?.price ?? 0;
            return pa - pb;
          }
        );
        setRoomTypes(sortedTypes);

        // Build color map: type -> { bg, fg }
        const colorMap: Record<string, { bg: string; fg: string }> = {};
        for (const r of rates) {
          colorMap[r.type] = {
            bg: r.badgeBg || DEFAULT_BADGE_BG,
            fg: r.badgeText || DEFAULT_BADGE_FG,
          };
        }
        setRateColors(colorMap);
      } catch (err: any) {
        console.error("Fetch error:", err);
        toast.error(err?.message || "Failed to fetch rooms/rates");
        // reasonable fallback order so UI is usable
        setRoomTypes(["Single", "Double", "Suite"]);
      } finally {
        setLoading(false);
        setTypesLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sort rooms by the price order of types (from rates)
  const sortRoomsByType = (roomsToSort: Room[]): Room[] => {
    if (roomTypes.length === 0) return roomsToSort;
    return [...roomsToSort].sort((a, b) => {
      const ia = roomTypes.indexOf(a.roomType);
      const ib = roomTypes.indexOf(b.roomType);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.roomType.localeCompare(b.roomType);
    });
  };

  // Filter + sort view data
  const filteredRooms = useMemo(() => {
    let result = rooms;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((room) =>
        room.roomNumber.toLowerCase().includes(q)
      );
    }

    if (filterType !== "all") {
      result = result.filter((room) => room.roomType === filterType);
    }

    return sortRoomsByType(result);
  }, [rooms, searchTerm, filterType, roomTypes]);

  // Pagination
  const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);
  const paginatedRooms = useMemo(
    () =>
      filteredRooms.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [filteredRooms, currentPage]
  );

  return (
    <>
      <Header />
      <div className="p-8">
        <Toaster />

        {/* Search + Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by room number..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>

          <div className="w-full sm:w-auto">
            <Select
              value={filterType}
              onValueChange={(value) => {
                setFilterType(value);
                setCurrentPage(1);
              }}
              disabled={typesLoading}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue
                  placeholder={
                    typesLoading ? "Loading types..." : "Filter by type"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Room Types</SelectItem>
                {roomTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Counter */}
        {(searchTerm || filterType !== "all") && (
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            Found {filteredRooms.length} rooms
            {searchTerm && ` for "${searchTerm}"`}
            {filterType !== "all" && ` in ${filterType}`}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, idx) => (
              <div key={idx} className="border rounded p-4 shadow space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center text-muted-foreground">
            {searchTerm || filterType !== "all"
              ? "No rooms match your criteria"
              : "No rooms available."}
          </div>
        ) : (
          <div className="grid md:grid-cols-10 gap-6">
            {paginatedRooms.map((room) => {
              const colors = rateColors[room.roomType] ?? {
                bg: DEFAULT_BADGE_BG,
                fg: DEFAULT_BADGE_FG,
              };

              return (
                <div
                  key={room.id}
                  className="border rounded-xl shadow cursor-pointer hover:bg-muted/30 flex items-center justify-center"
                  onClick={() => {
                    setSelectedRoom(room);
                    setOpenDrawerId(room.id);
                  }}
                >
                  <div className="flex flex-col items-center justify-center p-4">
                    <h2 className="text-2xl font-bold mb-2 text-center">
                      {room.roomNumber}
                    </h2>

                    {/* Badge styled from Rate colors */}
                    <Badge
                      className="text-lg"
                      style={{ backgroundColor: colors.bg, color: colors.fg }}
                      title={`${room.roomType} (${colors.bg} / ${colors.fg})`}
                    >
                      {room.roomType}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}

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
                <DrawerHeader className="border-b pb-4">
                  <DrawerTitle className="text-2xl font-bold">
                    Room Details
                  </DrawerTitle>
                  <DrawerDescription className="text-muted-foreground">
                    Full details for Room #{selectedRoom.roomNumber}
                  </DrawerDescription>
                </DrawerHeader>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex items-center justify-center">
                    {selectedRoom.images ? (
                      <Carousel className="w-full max-w-lg">
                        <CarouselContent>
                          {(Array.isArray(selectedRoom.images)
                            ? (selectedRoom.images as unknown as string[])
                            : selectedRoom.images.split(",")
                          )
                            .map((img) => String(img).trim())
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

                  <div className="flex flex-col md:flex-row items-center w-full">
                    <div className="hidden md:block w-px bg-gray-300 mx-6 h-full"></div>
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
                        <span className="font-bold">Price per night:</span> $
                        {selectedRoom.price}
                      </p>
                    </div>
                  </div>
                </div>

                <DrawerFooter className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                  <DrawerClose asChild>
                    <Button variant="outline" className="w-full">
                      Close
                    </Button>
                  </DrawerClose>

                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => {
                      navigate(`/Rooms/Create/${selectedRoom.id}`, {
                        state: selectedRoom.id,
                      });
                    }}
                  >
                    Edit
                  </Button>

                  <DeletePopup
                    id={`${selectedRoom.id}`}
                    message={`This will permanently delete Room #${selectedRoom.roomNumber} (${selectedRoom.roomType}). This action cannot be undone.`}
                    Area="Admin"
                    Controller="Room"
                    Action="Remove"
                    onDeleted={() => {
                      setRooms((prev) =>
                        prev.filter((r) => r.id !== selectedRoom.id)
                      );
                    }}
                  />
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
        )}

        {/* Pagination */}
        {!loading && filteredRooms.length > ITEMS_PER_PAGE && (
          <div className="mt-6 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((prev) => Math.max(prev - 1, 1));
                    }}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, idx) => (
                  <PaginationItem key={idx}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === idx + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(idx + 1);
                      }}
                    >
                      {idx + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                {totalPages > 5 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </>
  );
};

export default AllRooms;
