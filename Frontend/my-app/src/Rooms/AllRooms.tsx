"use client";

import Header from "@/components/Header/Header";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import DeletePopup from "@/DeletePopup";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";
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

const ITEMS_PER_PAGE = 70;

const AllRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [openDrawerId, setOpenDrawerId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${Url}/Admin/Room/GetAll`);
        if (res.status !== 200) throw new Error("Failed to fetch rooms");
        setRooms(res.data as Room[]);
      } catch (err: any) {
        toast.error(err?.message || "Something went wrong while fetching rooms");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // derived
  const totalPages = Math.ceil(rooms.length / ITEMS_PER_PAGE);
  const paginatedRooms = useMemo(
    () =>
      rooms.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [rooms, currentPage]
  );

  // helpers
  const getRoomBadgeClasses = (type: string) => {
    switch (type) {
      case "Double":
        return "bg-emerald-600 text-emerald-50";
      case "Suite":
        return "bg-emerald-800 text-emerald-50";
      default:
        return "bg-emerald-100 text-emerald-950";
    }
  };

  return (
    <>
      <Header />
      <div className="p-8">
        <Toaster />

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
        ) : rooms.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No rooms available.
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
                {/* Centered Content */}
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
                      <Carousel className="w-full max-w-lg"> {/* bigger width */}
                        <CarouselContent>
                          {(
                            Array.isArray(selectedRoom.images)
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
                      <p className="font-extrabold text-5xl mt-0 mb-25"><span className="font-extrabold"></span> {selectedRoom.roomNumber}</p>
                      <p><span className="font-bold">Type:</span> {selectedRoom.roomType}</p>
                      <p><span className="font-bold">Floor:</span> {selectedRoom.floor}</p>
                      <p><span className="font-bold">Capacity:</span> {selectedRoom.capacity}</p>
                      <p><span className="font-bold">Price per night:</span> {selectedRoom.price} EGP</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
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
                        state: selectedRoom.id
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
        {!loading && rooms.length > ITEMS_PER_PAGE && (
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
                      setCurrentPage((prev) =>
                        Math.min(prev + 1, totalPages)
                      );
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div >
    </>
  );
};

export default AllRooms;
