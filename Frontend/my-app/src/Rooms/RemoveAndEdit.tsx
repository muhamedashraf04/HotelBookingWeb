import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

const Remove = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5002/Admin/Room/Getall");
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
                <div
                  key={room.id}
                  className="border rounded-xl pl-4 pt-4 pb-0 shadow transition"
                >
                  <h2 className="text-2xl font-bold">{room.roomNumber}</h2>

                  <Badge
                    className={`text-lg ${
                      room.roomType === "Double"
                        ? "bg-blue-500 text-white"
                        : room.roomType === "Suite"
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button className="max-w-1/4 cursor-pointer">
                              Delete
                            </Button>
                          </AlertDialogTrigger>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete Room{" "}
                                {room.roomNumber}. You cannot undo this action.
                              </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                              <AlertDialogCancel className="cursor-pointer">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-500 text-white cursor-pointer hover:bg-red-700 hover:text-gray-100 transition-colors"
                                onClick={async () => {
                                  toast.loading(
                                    `Deleting Room ${room.roomNumber}`
                                  );

                                  try {
                                    const res = await fetch(
                                      `http://localhost:5002/Admin/Room/Remove?Id=${room.id}&RoomType=${room.roomType}`,
                                      { method: "DELETE" }
                                    );

                                    if (!res.ok)
                                      throw new Error("Failed to delete room");

                                    toast.success(
                                      `Room ${room.roomNumber} deleted successfully`
                                    );

                                    setRooms((prev) =>
                                      prev.filter((r) => r.id !== room.id)
                                    );
                                  } catch (err: any) {
                                    toast.error(
                                      err.message ||
                                        "Something went wrong while deleting the room"
                                    );
                                  }
                                }}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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

export default Remove;
