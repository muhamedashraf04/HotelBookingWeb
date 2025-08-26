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
import { Url } from "../../GlobalVariables.tsx";

interface RoomFormState {
  id?: number;
  roomNumber: string;
  roomType: "Single" | "Double" | "Suite";
  floor: number;
  capacity: number;
  isAvailable: boolean;
}

export default function CreateRoom() {
  const [formData, setFormData] = useState<RoomFormState>({
    roomNumber: "",
    roomType: "Single",
    floor: 0,
    capacity: 1,
    isAvailable: true,
  });
  const [images, setImages] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setImages((prev) => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roomNumber.trim())
      return toast.error("Room number is required");

    setSaving(true);
    try {
      // Create room first
      const roomResponse = await axios.post(`${Url}/Admin/Room/Upsert`, {
        id: 0,
        ...formData,
      });

      // Upload images if any
      if (images.length > 0) {
        const imageFormData = new FormData();
        images.forEach((file) => imageFormData.append("images", file));
        imageFormData.append("roomId", roomResponse.data.roomId);

        await axios.post(`${Url}/Admin/Room/UploadImages`, imageFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success("Room created successfully!");
      setFormData({
        roomNumber: "",
        roomType: "Single",
        floor: 0,
        capacity: 1,
        isAvailable: true,
      });
      setImages([]);
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
        <h1 className="text-2xl font-bold">Create New Room</h1>

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

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {images.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    className="w-full h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
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
          {saving ? "Creating..." : "Create Room"}
        </Button>
      </form>
    </>
  );
}
