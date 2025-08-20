"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import Header from "@/Header/Header";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";

type Room = {
  id: number;
  roomNumber: string;
  floor: number;
  capacity: number;
  isAvailable: boolean;
  roomType: string;
};

const Getall = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRoom, setExpandedRoom] = useState<number | null>(null); // track accordion state
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5002/Admin/Room/GetAll");
        if (!res.ok) throw new Error("Failed to fetch rooms");
        const data: Room[] = await res.json();
        setRooms(data);
      } catch (err: any) {
        toast.error(err.message || "Something went wrong while fetching rooms");
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const totalPages = Math.ceil(rooms.length / itemsPerPage);
  const paginatedRooms = rooms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const skeletons = Array.from({ length: itemsPerPage });

  return (
    <>
      <Header />
      <div className="p-8">
        <Toaster />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading
            ? skeletons.map((_, idx) => (
                <div key={idx} className="border rounded p-4 shadow space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))
            : paginatedRooms.length === 0
            ? "No rooms available."
            : paginatedRooms.map((room) => (
                <Accordion
                  type="single"
                  collapsible
                  key={room.id}
                  className="border rounded-xl shadow transition cursor-pointer"
                  value={
                    expandedRoom === room.id ? `room-${room.id}` : undefined
                  }
                >
                  <AccordionItem
                    value={`room-${room.id}`}
                    onClick={() =>
                      setExpandedRoom(expandedRoom === room.id ? null : room.id)
                    }
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-2xl font-bold">
                            {room.roomNumber}
                          </h2>
                          <Badge
                            className={`text-lg mt-1 ${
                              room.roomType === "Double"
                                ? "bg-blue-500 text-white"
                                : room.roomType === "Suite"
                                ? "bg-red-950 text-white"
                                : "bg-gray-200 text-black"
                            }`}
                          >
                            {room.roomType}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xl">Floor: {room.floor}</p>
                          <p className="text-xl">Capacity: {room.capacity}</p>
                        </div>
                      </div>

                      <AccordionContent className="mt-4 flex flex-col gap-4">
                        <Button
                          className={`w-full ${
                            room.isAvailable
                              ? "cursor-pointer"
                              : "cursor-not-allowed"
                          }`}
                          onClick={() =>
                            toast.loading(`Booking Room ${room.roomNumber}`)
                          }
                          disabled={!room.isAvailable}
                        >
                          {room.isAvailable ? "Book Now" : "Unavailable"}
                        </Button>
                      </AccordionContent>
                    </div>
                  </AccordionItem>
                </Accordion>
              ))}
        </div>

        {/* Pagination */}
        {!loading && rooms.length > itemsPerPage && (
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

export default Getall;
