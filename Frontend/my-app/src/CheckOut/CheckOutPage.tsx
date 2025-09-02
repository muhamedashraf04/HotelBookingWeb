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
  dues: number;
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

export default function CheckoutPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState<Reservation | null>(
    location.state?.reservation || null
  );
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [room, setRoom] = useState<Room | null>(null);

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

  // Fetch customer
  useEffect(() => {
    if (reservation?.customerId) {
      axios
        .get(`${Url}/Admin/Customer/Get/?id=${reservation.customerId}`)
        .then((res) => setCustomer(res.data))
        .catch(() => toast.error("Failed to load customer"));
    }
  }, [reservation?.customerId]);

  // Fetch room
  useEffect(() => {
    if (reservation?.roomId) {
      axios
        .get(`${Url}/Admin/Room/GetRoom/?id=${reservation.roomId}`)
        .then((res) => setRoom(res.data))
        .catch(() => toast.error("Failed to load room"));
    }
  }, [reservation?.roomId]);

  // Image upload
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

  // Submit checkout
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservation) return toast.error("Reservation not loaded");

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("id", reservation.id.toString());
      formData.append("paid", reservation.paid.toString());
      formData.append("dues", reservation.dues.toString());
      images.forEach((file) => formData.append("uploadedFiles", file));

      await axios.patch(`${Url}/Admin/Checkout/Out`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Guest checked out successfully!");
      navigate("/");
    } catch (err: any) {
      toast.error(err?.response?.data ?? "Failed to check out");
    } finally {
      setSaving(false);
    }
  };

  const format = (n: number) => n.toFixed(2);

  return (
    <>
      <Header />
      <Toaster />
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow-lg"
      >
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Check-Out Guest
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Complete the check-out process for the reservation.
        </p>

        {/* Reservation Details */}
        <section className="p-5 border border-gray-200 rounded-xl space-y-4 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Reservation & Guest Information
          </h2>
          {reservation ? (
            <div className="grid md:grid-cols-2 gap-5">
              {/* Customer */}
              <div className="space-y-2">
                <h3 className="font-bold text-gray-600">Customer</h3>
                {customer ? (
                  <div className="ml-2 text-sm text-gray-800 space-y-1">
                    <p>
                      <span className="font-medium">Name:</span> {customer.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {customer.email}
                    </p>
                    <p>
                      <span className="font-medium">ID:</span>{" "}
                      {customer.identificationNumber}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {customer.phone}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">Loading customer...</p>
                )}
              </div>

              {/* Room */}
              <div className="space-y-2">
                <h3 className="font-bold text-gray-600">Room</h3>
                {room ? (
                  <div className="ml-2 text-sm text-gray-800 space-y-1">
                    <p>
                      <span className="font-medium">Room Number:</span>{" "}
                      {room.roomNumber}
                    </p>
                    <p>
                      <span className="font-medium">Type:</span> {room.roomType}
                    </p>
                    <p>
                      <span className="font-medium">Floor:</span> {room.floor}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">Loading room...</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500">Loading reservation...</p>
          )}
        </section>

        {/* Financial Summary */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mt-6">
          <div className="p-4 bg-blue-50 rounded-lg shadow-sm border border-blue-200">
            <p className="text-sm text-blue-700">Paid</p>
            <p className="text-2xl font-bold text-blue-900">
              {format(reservation?.paid || 0)}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg shadow-sm border border-red-200">
            <p className="text-sm text-red-700">Dues</p>
            <p className="text-2xl font-bold text-red-900">
              {format(reservation?.dues || 0)}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg shadow-sm border border-green-200">
            <p className="text-sm text-green-700">Status</p>
            <p className="text-2xl font-bold text-green-900">
              {reservation?.status}
            </p>
          </div>
        </section>
        {/* Final Summary of Charges */}
        <section className="mt-6 p-5 bg-gray-100 rounded-xl shadow-inner border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Final Summary
          </h2>
          <div className="flex justify-between items-center text-sm mb-1">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-mono text-gray-800">
              EGP {format((reservation?.paid || 0) - (reservation?.dues || 0))}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm text-red-600 mb-2">
            <span className="font-medium">Discount Applied:</span>
            <span className="font-mono">
              - EGP {format(reservation?.discount || 0)}
            </span>
          </div>
          <hr className="border-gray-300 mb-2" />
          <div className="flex justify-between items-center text-lg font-bold text-gray-900 mb-4">
            <span>Total After Discount:</span>
            <span>
              EGP{" "}
              {format(
                (reservation?.paid || 0) +
                  (reservation?.dues || 0) -
                  (reservation?.discount || 0)
              )}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Total Paid (Previous):</span>
              <span className="font-mono text-gray-800">
                EGP {format(reservation?.paid || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center text-lg font-semibold">
              <span className="text-gray-600">Remaining Due:</span>
              <span
                className={`font-mono ${
                  (reservation?.paid || 0) +
                    (reservation?.dues || 0) -
                    (reservation?.discount || 0) <=
                  0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                EGP{" "}
                {format(
                  Math.max(
                    0,
                    (reservation?.paid || 0) +
                      (reservation?.dues || 0) -
                      (reservation?.discount || 0)
                  )
                )}
              </span>
            </div>
          </div>
        </section>

        {/* Proof of Payment Images */}
        <section className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold text-gray-700">
            Proof of Payment Images
          </h2>
          <p className="text-gray-500 text-sm">
            Upload up to 5 images (max 5MB each).
          </p>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer transition-colors hover:bg-gray-50"
          >
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-600 font-medium">Click or drag to upload</p>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((file, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    className="w-full h-28 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Submit */}
        <Button
          type="submit"
          disabled={saving}
          className="w-full text-lg py-3 rounded-lg mt-6"
        >
          {saving ? "Processing Check-Out..." : "Submit Check-Out"}
        </Button>
      </form>
    </>
  );
}
