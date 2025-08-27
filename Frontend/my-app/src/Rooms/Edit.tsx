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
import { Url } from "../../GlobalVariables.tsx";

// Types
export type Room = {
  id: number;
  roomNumber: string;
  floor: number;
  capacity: number;
  isAvailable: boolean;
  roomType: string;
};

const ITEMS_PER_PAGE = 20;

const Edit = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRoom, setExpandedRoom] = useState<string | undefined>();

  // inline edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<Room | null>(null);

  // load rooms once
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${Url}/Admin/Room/GetAll`);
        if (res.status !== 200) throw new Error("Failed to fetch rooms");
        setRooms(res.data as Room[]);
      } catch (err: any) {
        toast.error(
          err?.message || "Something went wrong while fetching rooms"
        );
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

  const startEdit = (room: Room) => {
    setEditingId(room.id);
    setEditDraft({ ...room });
    setExpandedRoom(`room-${room.id}`); // ensure open while editing
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEdit = async () => {
    if (!editDraft) return;
    try {
      await axios.post(`${Url}/Admin/Room/Upsert`, {
        id: editDraft.id,
        roomNumber: editDraft.roomNumber,
        floor: editDraft.floor,
        capacity: editDraft.capacity,
        isAvailable: editDraft.isAvailable,
        roomType: editDraft.roomType,
      });
      toast.success("Room updated");

      setRooms((prev) =>
        prev.map((r) => (r.id === editDraft.id ? { ...editDraft } : r))
      );
      cancelEdit();
    } catch (e: any) {
      toast.error(e?.response?.data ?? "Failed to save");
    }
  };

  return (
    <>
      <Header />
      <div className="p-8">
        <Toaster />

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
          <Accordion
            type="single"
            collapsible
            value={expandedRoom}
            onValueChange={(v) => setExpandedRoom(v)}
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {paginatedRooms.map((room) => {
              const value = `room-${room.id}`;
              const isEditing = editingId === room.id;
              return (
                <AccordionItem
                  key={value}
                  value={value}
                  className="border rounded-xl shadow"
                >
                  {/* Header */}
                  <AccordionTrigger className="px-4 py-3 hover:no-underline  cursor-pointer">
                    <div className="flex w-full items-center justify-between">
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
                      <div className="text-right">
                        <p className="text-sm">Floor: {room.floor}</p>
                        <p className="text-sm">Capacity: {room.capacity}</p>
                        <p className="text-sm">
                          {room.isAvailable ? "Available" : "Unavailable"}
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>

                  {/* Content */}
                  <AccordionContent className="px-4 pb-4">
                    {!isEditing ? (
                      <div className="flex gap-3">
                        <DeletePopup
                          id={`${room.id}`}
                          message={`This will permanently delete Room #${room.roomNumber} (${room.roomType}). This action cannot be undone.`}
                          Area="Admin"
                          Controller="Room"
                          Action="Remove"
                          onDeleted={() => {
                            setRooms((prev) =>
                              prev.filter((r) => r.id !== room.id)
                            );
                          }}
                        />
                        <Button
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(room);
                          }}
                        >
                          Edit
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="space-y-3"
                        onClick={(e) => e.stopPropagation()} // keep open while editing
                      >
                        <div className="grid grid-cols-2 gap-3">
                          <label className="text-sm">
                            <span className="block mb-1">Room #</span>
                            <input
                              className="w-full border rounded px-2 py-1"
                              value={editDraft?.roomNumber ?? ""}
                              onChange={(e) =>
                                setEditDraft((d) => ({
                                  ...(d as Room),
                                  roomNumber: e.target.value,
                                }))
                              }
                            />
                          </label>

                          <label className="text-sm">
                            <span className="block mb-1">Type</span>
                            <select
                              className="w-full border rounded px-2 py-1"
                              value={editDraft?.roomType ?? "Single"}
                              onChange={(e) => {
                                const v = e.target.value as Room["roomType"];
                                setEditDraft((d) => {
                                  const cur = d as Room;
                                  return {
                                    ...cur,
                                    roomType: v,
                                    capacity:
                                      v === "Single"
                                        ? 1
                                        : v === "Double"
                                        ? 2
                                        : Math.max(cur.capacity, 3),
                                  };
                                });
                              }}
                            >
                              <option value="Single">Single</option>
                              <option value="Double">Double</option>
                              <option value="Suite">Suite</option>
                            </select>
                          </label>

                          <label className="text-sm">
                            <span className="block mb-1">Floor</span>
                            <input
                              type="number"
                              className="w-full border rounded px-2 py-1"
                              value={editDraft?.floor ?? 0}
                              onChange={(e) =>
                                setEditDraft((d) => ({
                                  ...(d as Room),
                                  floor: Number(e.target.value || 0),
                                }))
                              }
                            />
                          </label>

                          <label className="text-sm">
                            <span className="block mb-1">Capacity</span>
                            <input
                              type="number"
                              className="w-full border rounded px-2 py-1"
                              value={editDraft?.capacity ?? 1}
                              onChange={(e) =>
                                setEditDraft((d) => ({
                                  ...(d as Room),
                                  capacity: Number(e.target.value || 1),
                                }))
                              }
                            />
                          </label>
                        </div>

                        <label className="inline-flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={!!editDraft?.isAvailable}
                            onChange={(e) =>
                              setEditDraft((d) => ({
                                ...(d as Room),
                                isAvailable: e.target.checked,
                              }))
                            }
                          />
                          <span>Available</span>
                        </label>

                        <div className="flex gap-2">
                          <Button className="flex-1" onClick={saveEdit}>
                            Save
                          </Button>
                          <Button variant="secondary" onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
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
export default Edit;
