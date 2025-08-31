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
import Cookies from "js-cookie";
import { Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { Url } from "../../GlobalVariables.tsx";

interface RoomFormState {
  id?: number;
  roomNumber: string;
  roomType: string;
  floor: number;
  capacity: number;
  Price: number;
  Images: string | null;
}

interface Rate {
  id?: number;
  type: string;
  price: number;
}

export default function CreateRoom() {
  const [formData, setFormData] = useState<RoomFormState>({
    roomNumber: "",
    roomType: "Single",
    floor: 0,
    capacity: 0,
    Price: 0,
    Images: null,
  });

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { id } = useParams<{ id: string }>();
  const [roomtypes, setroomtypes] = useState<string[]>([]);
  const [rates, setrates] = useState<Rate[]>([]);

  useEffect(() => {
    const fetchrates = async () => {
      try {
        const response = await axios.get(`${Url}/Admin/Rate/Getall`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });

        setrates(response.data);

        // Extract room types from rates
        const types = response.data.map((rate: Rate) => rate.type);
        setroomtypes(types);
      } catch (error) {
        console.error("Failed to fetch rates:", error);
        toast.error("Failed to load rates");
      }
    };

    fetchrates();
  }, []);

  useEffect(() => {
    if (!id) return;

    axios
      .get(`${Url}/Admin/Room/GetRoom?id=${id}`)
      .then((res) => {
        const room = res.data;

        if (!room) {
          toast.error("Room not found");
          return;
        }

        const validRoomTypes = roomtypes;
        const safeRoomType = validRoomTypes.includes(room.roomType)
          ? room.roomType
          : "Single";

        setFormData({
          id: room.id ?? undefined,
          roomNumber: room.roomNumber ?? "",
          roomType: safeRoomType,
          floor: room.floor ?? 0,
          capacity: room.capacity ?? 0,
          Price: room.price ?? 0,
          Images: room.Images ?? null,
        });

        setExistingImages(
          typeof room.images === "string" && room.images.trim().length > 0
            ? room.images
                .split(",")
                .map((img: string) => img.trim())
                .filter((img: string) => img.length > 0)
            : []
        );
      })
      .catch((err) => {
        console.error("Error loading room:", err);
        toast.error("Failed to load room data");
      });
  }, [id, roomtypes]);

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

  const handleRoomTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      roomType: value as string,
    }));
  };

  // ✅ Enhanced validation for image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];

    if (existingImages.length + newImages.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`❌ ${file.name} is not a valid image type.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`⚠️ ${file.name} exceeds 5 MB.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setNewImages((prev) => [...prev, ...validFiles]);
    }

    e.target.value = ""; // reset so same file can be chosen again
  };

  const handleDeleteImage = (image: string | File) => {
    if (typeof image === "string") {
      setExistingImages((prev) => prev.filter((img) => img !== image));
      setDeletedImages((prev) => [...prev, image]);
    } else {
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

      imageFormData.append("room.Id", formData.id?.toString() ?? "0");
      imageFormData.append("room.RoomNumber", formData.roomNumber);
      imageFormData.append("room.RoomType", formData.roomType);
      imageFormData.append("room.Floor", formData.floor.toString());
      imageFormData.append("room.Capacity", formData.capacity.toString());
      imageFormData.append("room.Price", formData.Price.toString());

      newImages.forEach((file) => imageFormData.append("uploadedFiles", file));

      if (deletedImages.length > 0) {
        imageFormData.append("deletedImages", JSON.stringify(deletedImages));
      }

      await axios.post(`${Url}/Admin/Room/Upsert`, imageFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });

      setFormData({
        roomNumber: "",
        roomType: "Single",
        floor: 0,
        capacity: 1,
        Price: 0,
        Images: null,
      });

      toast.success(
        id ? "Room updated successfully!" : "Room created successfully!"
      );
      setTimeout(() => {
        navigate("/Rooms/AllRooms");
      }, 1000);

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
        <h1 className="text-2xl font-bold">
          {id ? "Update Room" : "Create Room"}
        </h1>

        <div className="grid grid-cols-2 gap-4">
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
                  {roomtypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
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
          {saving
            ? id
              ? "Updating..."
              : "Creating..."
            : id
            ? "Update Room"
            : "Create Room"}
        </Button>
      </form>
    </>
  );
}
