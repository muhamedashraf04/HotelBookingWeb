"use client";
import Header from "@/components/Header/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { Url } from "../../GlobalVariables.tsx";

interface Reservation {
  id: number;
  customerId: number;
  roomId: number;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  paid: number;
  discount: number;
  status: string;
}

interface Customer {
  identificationNumber: number;
  name: string;
  email: string;
  phone: string;
}

interface Room {
  id: number;
  roomNumber: string;
  roomType: string;
  floor: number;
}

export default function CheckInPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState<Reservation | null>(
    location.state?.reservation || null
  );
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [room, setRoom] = useState<Room | null>(null);

  const [paid, setPaid] = useState<number>(reservation?.paid || 0);
  const [discount, setDiscount] = useState<number>(reservation?.discount || 0);
  const [images, setImages] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch reservation if not passed
  useEffect(() => {
    if (!reservation && id) {
      axios
        .get(`${Url}/Admin/Reservation/Get/?id=${id}`)
        .then((res) => setReservation(res.data))
        .catch(() => toast.error("Failed to load reservation"));
    }
  }, [id, reservation]);

  // Fetch customer when reservation is loaded
  useEffect(() => {
    if (reservation?.customerId) {
      axios
        .get(`${Url}/Admin/Customer/Get/?id=${reservation.customerId}`)
        .then((res) => setCustomer(res.data))
        .catch(() => toast.error("Failed to load customer"));
    }
  }, [reservation?.customerId]);

  // Fetch room when reservation is loaded
  useEffect(() => {
    if (reservation?.roomId) {
      axios
        .get(`${Url}/Admin/Room/GetRoom/?id=${reservation.roomId}`)
        .then((res) => setRoom(res.data))
        .catch(() => toast.error("Failed to load room"));
    }
  }, [reservation?.roomId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservation) return toast.error("Reservation not loaded");

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("id", reservation.id.toString());
      formData.append("paid", paid.toString());
      formData.append("discount", discount.toString());
      images.forEach((file) => formData.append("uploadedFiles", file));

      await axios.patch(`${Url}/Admin/Checkin/In`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Guest checked in successfully!");
      navigate("/");
    } catch (err: any) {
      toast.error(err?.response?.data ?? "Failed to check in");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />
      <Toaster />
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Check-In</h1>

        {reservation && (
          <div className="p-4 border rounded space-y-2">
            <h3 className="font-semibold">Customer</h3>
            {customer ? (
              <div className="ml-4">
                <p>Name: {customer.name}</p>
                <p>Email: {customer.email}</p>
                <p>ID: {customer.identificationNumber}</p>
                <p>Phone: {customer.phone}</p>
              </div>
            ) : (
              <p>Loading customer...</p>
            )}

            <h3 className="font-semibold mt-2">Room</h3>
            {room ? (
              <div className="ml-4">
                <p>Room Number: {room.roomNumber}</p>
                <p>Type: {room.roomType}</p>
                <p>Floor: {room.floor}</p>
              </div>
            ) : (
              <p>Loading room...</p>
            )}

            <p>
              <strong>Dates:</strong> {reservation.checkInDate} →{" "}
              {reservation.checkOutDate}
            </p>
            <p>
              <strong>Status:</strong> {reservation.status}
            </p>
          </div>
        )}

        <label className="block">
          <span className="block mb-2 font-medium">Paid Amount</span>
          <Input
            type="number"
            value={paid}
            onChange={(e) => setPaid(Number(e.target.value))}
            required
          />
        </label>

        <label className="block">
          <span className="block mb-2 font-medium">Discount</span>
          <Input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
          />
        </label>

        <div className="space-y-3">
          <span className="block font-medium">
            Proof of Payment Images (max 5)
          </span>
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
          {saving ? "Checking In..." : "Submit Check-In"}
        </Button>
      </form>
    </>
  );
}
