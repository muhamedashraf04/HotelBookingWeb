"use client";
import Header from "@/components/Header/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import { useEffect } from "react";
import { Url } from "../../GlobalVariables.tsx";
import { useParams } from "react-router-dom";


interface RoomFormState {
  id?: number;
  roomNumber: string;
  roomType: "Single" | "Double" | "Suite";
  floor: number;
  capacity: number;
  isAvailable: boolean;
  Price: number;
  Images: string | null;
}

export default function CreateRoom() {
  const [formData, setFormData] = useState<RoomFormState>({
    roomNumber: "",
    roomType: "Single",
    floor: 0,
    capacity: 0,
    isAvailable: false,
    Price: 0,
    Images: null,
  });

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { id } = useParams<{ id: string }>();
  useEffect(() => {
    if (!id) return;

    axios.get(`${Url}/Admin/Room/GetRoom?id=${id}`)
      .then((res) => {
        const room = res.data;

        if (!room) {
          toast.error("Room not found");
          return;
        }

        // ✅ Ensure roomType is always one of the allowed values
        const validRoomTypes = ["Single", "Double", "Suite"];
        const safeRoomType = validRoomTypes.includes(room.roomType)
          ? room.roomType
          : "Single";

        setFormData({
          id: room.id ?? undefined,
          roomNumber: room.roomNumber ?? "",
          roomType: safeRoomType as "Single" | "Double" | "Suite",
          floor: room.floor ?? 0,
          capacity: room.capacity ?? 0,
          isAvailable: room.isAvailable ?? false,
          Price: room.price ?? 0,
          Images: room.Images ?? null
        });

        setExistingImages(
          room.images === "" ?
            room.images = null :
            typeof room.images === "string"
              ? room.images.split(",").map((img: string) => img.trim())
              : null
        );
      })
      .catch((err) => {
        console.error("Error loading room:", err);
        toast.error("Failed to load room data");
      });
  }, [id]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : parseInt(value) || value,
    }));
  };

  // dedicated handler for shadcn dropdown
  const handleRoomTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      roomType: value as "Single" | "Double" | "Suite",
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (existingImages.length + newImages.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setNewImages((prev) => [...prev, ...files]);
  };

  const handleDeleteImage = (image: string | File) => {
    if (typeof image === "string") {
      // it's an existing image (URL)
      setExistingImages((prev) => prev.filter((img) => img !== image));
      setDeletedImages((prev) => [...prev, image]);
    } else {
      // it's a new image (File)
      setNewImages((prev) => prev.filter((file) => file !== image));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roomNumber.trim())
      return toast.error("Room number is required");

    setSaving(true);
    try {
      const imageFormData = new FormData();

      // Append room fields
      imageFormData.append("room.Id", formData.id?.toString() ?? "0");
      imageFormData.append("room.RoomNumber", formData.roomNumber);
      imageFormData.append("room.RoomType", formData.roomType);
      imageFormData.append("room.Floor", formData.floor.toString());
      imageFormData.append("room.Capacity", formData.capacity.toString());
      imageFormData.append("room.IsAvailable", formData.isAvailable.toString());
      imageFormData.append("room.Price", formData.Price.toString());

      // Append new uploaded files
      newImages.forEach((file) =>
        imageFormData.append("uploadedFiles", file)
      );

      // Append deleted images as JSON string
      if (deletedImages.length > 0) {
        imageFormData.append("deletedImages", JSON.stringify(deletedImages));
      }

      // Send everything in one request
      await axios.post(`${Url}/Admin/Room/Upsert`, imageFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Room created successfully!");
      setFormData({
        roomNumber: "",
        roomType: "Single",
        floor: 0,
        capacity: 1,
        isAvailable: true,
        Price: 0,
        Images: null
      });
      setExistingImages([]);
      setNewImages([]);
      setDeletedImages([]);

    } catch (e: any) {
      toast.error(e?.response?.data ?? "Failed to create room");
    } finally {
      setSaving(false);
    }
  };


  return (
    <>
      <Header />
      <Toaster />
      <form onSubmit={submit} className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold"> {saving ? (id ? "Updating..." : "Creating...") : id ? "Update Room" : "Create Room"}</h1>

        <div className="grid grid-cols-2 gap-4">
          {/* Room Type with shadcn Select */}
          <label className="block">
            <span className="block mb-2 font-medium">Room Type</span>
            <Select
              onValueChange={handleRoomTypeChange}
              value={formData.roomType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select room type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Double">Double</SelectItem>
                  <SelectItem value="Suite">Suite</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </label>

          <label className="block">
            <span className="block mb-2 font-medium">Room Number *</span>
            <Input
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              required
            />
          </label>

          <label className="block">
            <span className="block mb-2 font-medium">Floor</span>
            <Input
              name="floor"
              type="number"
              value={formData.floor}
              onChange={handleChange}
            />
          </label>

          <label className="block">
            <span className="block mb-2 font-medium">Capacity</span>
            <Input
              name="capacity"
              type="number"
              value={formData.capacity}
              onChange={handleChange}
            />
          </label>
        </div>

        <label className="flex items-center gap-2">
          <input
            name="isAvailable"
            type="checkbox"
            checked={formData.isAvailable}
            onChange={handleChange}
          />
          <span>Available for booking</span>
        </label>

        {/* Image Upload Section */}
        <div className="space-y-3">
          <span className="block font-medium">Room Images (max 5)</span>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded p-4 text-center cursor-pointer"
          >
            <Upload className="w-6 h-6 mx-auto mb-2" />
            <p>Click to upload images</p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {(existingImages.length > 0 || newImages.length > 0) && (
            <div className="grid grid-cols-3 gap-2">
              {/* Existing images */}
              {existingImages.map((url, index) => (
                <div key={`existing-${index}`} className="relative">
                  <img
                    src={url}
                    alt={`Existing ${index}`}
                    className="w-full h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(url)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* New images */}
              {newImages.map((file, index) => (
                <div key={`new-${index}`} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`New ${index}`}
                    className="w-full h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(file)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? (id ? "Updating..." : "Creating...") : id ? "Update Room" : "Create Room"}
        </Button>
      </form>
    </>
  );
}
