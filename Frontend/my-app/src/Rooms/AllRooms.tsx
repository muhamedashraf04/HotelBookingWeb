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

interface Rate {
  id?: number;
  type: string;
  price: number;
}

const ITEMS_PER_PAGE = 70;

const AllRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDrawerId, setOpenDrawerId] = useState<number | null>(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [roomTypes, setRoomTypes] = useState<string[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);

  // Function to fetch room types from Rates API
  const fetchRoomTypes = async (): Promise<string[]> => {
    try {
      const response = await axios.get(`${Url}/Admin/Rate/GetAll`);
      const rates: Rate[] = response.data;

      // Extract unique room types
      const types = [...new Set(rates.map((rate: Rate) => rate.type))];

      // Sort types based on price (cheapest first)
      const sortedTypes = types.sort((a, b) => {
        const rateA = rates.find((r: Rate) => r.type === a);
        const rateB = rates.find((r: Rate) => r.type === b);
        return (rateA?.price || 0) - (rateB?.price || 0);
      });

      return sortedTypes;
    } catch (error) {
      console.error("Failed to fetch room types:", error);
      return ["Single", "Double", "Suite"]; // Fallback to default
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setTypesLoading(true);

      try {
        // Fetch rooms
        const roomsResponse = await axios.get(`${Url}/Admin/Room/GetAll`);
        if (roomsResponse.status !== 200)
          throw new Error("Failed to fetch rooms");
        setRooms(roomsResponse.data as Room[]);

        // Fetch room types from Rates
        const types = await fetchRoomTypes();
        setRoomTypes(types);
      } catch (err: any) {
        toast.error(err?.message || "Something went wrong while fetching data");
        setRoomTypes(["Single", "Double", "Suite"]);
      } finally {
        setLoading(false);
        setTypesLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to sort rooms by type in consistent order
  const sortRoomsByType = (roomsToSort: Room[]): Room[] => {
    if (roomTypes.length === 0) return roomsToSort;

    return [...roomsToSort].sort((a, b) => {
      const indexA = roomTypes.indexOf(a.roomType);
      const indexB = roomTypes.indexOf(b.roomType);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }

      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;

      return a.roomType.localeCompare(b.roomType);
    });
  };

  const filteredRooms = useMemo(() => {
    let result = rooms;

    if (searchTerm) {
      result = result.filter((room) =>
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== "all") {
      result = result.filter((room) => room.roomType === filterType);
    }

    return sortRoomsByType(result);
  }, [rooms, searchTerm, filterType, roomTypes]);

  const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);
  const paginatedRooms = useMemo(
    () =>
      filteredRooms.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [filteredRooms, currentPage]
  );

  // Updated badge classes to handle dynamic types
  const getRoomBadgeClasses = (type: string) => {
    const typeIndex = roomTypes.indexOf(type);

    switch (typeIndex) {
      case 0: // First type (usually cheapest)
        return "bg-blue-100 text-blue-900";
      case 1: // Second type
        return "bg-blue-300 text-blue-900";
      case 2: // Third type
        return "bg-sky-700 text-blue-100";
      case 3: // Fourth type
        return "bg-blue-900 text-blue-200";
      default: // Any additional types
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Header />
      <div className="p-8">
        <Toaster />

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
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

          {/* Filter Bar */}
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

        {/* Search results counter */}
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
            {paginatedRooms.map((room) => (
              <div
                key={room.id}
                className="border rounded-xl shadow cursor-pointer hover:bg-muted/30 flex items-center justify-center"
                onClick={() => {
                  setSelectedRoom(room);
                  setOpenDrawerId(room.id);
                  console.log("Selected room:", room);
                }}
              >
                <div className="flex flex-col items-center justify-center p-4">
                  <h2 className="text-2xl font-bold mb-2 text-center">
                    {room.roomNumber}
                  </h2>
                  <Badge
                    className={`text-lg ${getRoomBadgeClasses(room.roomType)}`}
                  >
                    {room.roomType}
                  </Badge>
                </div>
              </div>
            ))}
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
