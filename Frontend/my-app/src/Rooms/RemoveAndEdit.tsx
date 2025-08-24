import Header from "@/components/Header/Header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
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
import ErrorToast from "@/Toasts/ErrorToast";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { Url } from "../../GlobalVariables.tsx";

type Room = {
  id: number;
  roomNumber: string;
  floor: number;
  capacity: number;
  isAvailable: boolean;
  roomType: string;
};

const Remove = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${Url}/Admin/Room/Getall`);
        if (!res.ok) throw new Error("Failed to fetch rooms");
        const data: Room[] = await res.json();
        setRooms(data);
      } catch (err: any) {
        ErrorToast(err.message || "Something went wrong while fetching rooms");
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
            : paginatedRooms.length == 0
            ? "No rooms available."
            : paginatedRooms.map((room) => (
                <div
                  key={room.roomNumber}
                  className="border rounded-xl pl-4 pt-4 pb-0 shadow transition"
                >
                  <h2 className="text-2xl font-bold">{room.roomNumber}</h2>

                  <Badge
                    className={`text-lg ${
                      room.roomType == "Double"
                        ? "bg-blue-500 text-white"
                        : room.roomType == "Suite"
                        ? "bg-red-950 text-white"
                        : "bg-gray-200 text-black" // fallback for Single or others
                    }`}
                  >
                    {room.roomType}
                  </Badge>

                  <p className="text-xl">Floor: {room.floor}</p>
                  <p className="text-xl">Capacity: {room.capacity}</p>

                  {/* Accordion for Deleting */}
                  <Accordion type="single" collapsible className="mt-2 w-full">
                    <AccordionItem value={`room-${room.id}`}>
                      <AccordionTrigger></AccordionTrigger>
                      <AccordionContent className="flex flex-col gap-4">
                        <DeletePopup
                          id={`${room.id}`}
                          message={`This will permanently delete Room #${room.roomNumber} (${room.roomType}). This action cannot be undone.`}
                          Area="Admin"
                          Controller="Room"
                          Action="Remove"
                          RoomType={`${room.roomType}`}
                          onDeleted={() => {
                            setRooms((prev) =>
                              prev.filter(
                                (r) =>
                                  !(
                                    r.roomNumber === room.roomNumber &&
                                    r.roomType === room.roomType
                                  )
                              )
                            );
                          }}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
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
                      isActive={currentPage == idx + 1}
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

export default Remove;
