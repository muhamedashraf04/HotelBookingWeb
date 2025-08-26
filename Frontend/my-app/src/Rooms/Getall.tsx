"use client";

import Header from "@/components/Header/Header";
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
import axios from "axios";
import { useEffect, useState } from "react";
import { toast, Toaster } from "sonner";
import { Url } from "../../GlobalVariables.tsx";
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
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null); // track accordion state
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${Url}/Admin/Room/GetAll`);
        console.log(response.status);
        if (!(response.status == 200)) throw new Error("Failed to fetch rooms");
        const rooms: Room[] = await response.data;
        setRooms(rooms);
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
  return (
    <>
      <Header />
      <div className="ml-8 mr-8">
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
            ? toast.error("No rooms available.")
            : paginatedRooms.map((room) => (
                <Accordion
                  type="single"
                  collapsible
                  key={room.roomNumber}
                  className="border rounded-xl shadow transition cursor-pointer"
                  value={
                    expandedRoom === room.roomNumber
                      ? `room-${room.roomNumber}`
                      : undefined
                  }
                >
                  <AccordionItem
                    value={`room-${room.roomNumber}`}
                    onClick={() =>
                      setExpandedRoom(
                        expandedRoom === room.roomNumber
                          ? null
                          : room.roomNumber
                      )
                    }
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-center">
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
