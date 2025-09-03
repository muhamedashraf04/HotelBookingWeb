"use client";
import Header from "@/components/Header/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import Cookies from "js-cookie";
import { Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { Url } from "../../GlobalVariables";

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
  phoneNumber: string;
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

  // Payment & discount states
  const [paymentNow, setPaymentNow] = useState<number>(0);
  const [discountMode, setDiscountMode] = useState<"amount" | "percent">(
    "amount"
  );
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [discountLimit, setDiscountLimit] = useState<number>(100); // Default to 100% until fetched
  const [isDiscountLimitLoading, setIsDiscountLimitLoading] =
    useState<boolean>(true);

  // Images
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const MAX_IMAGES = 5;

  // Function to clamp a value between a min and max
  const clamp = (v: number, min: number, max: number) =>
    Math.min(Math.max(Number.isFinite(v) ? v : 0, min), max);

  // Fetch the user's discount limit on component load
  useEffect(() => {
    const fetchDiscountLimit = async () => {
      setIsDiscountLimitLoading(true);
      try {
        const res = await axios.get(`${Url}/api/Auth/GetDiscountLimit`, {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        });

        setDiscountLimit(res.data.limit);
      } catch (err) {
        toast.error("Failed to load discount limit. Please try again.");
        console.error("Failed to fetch discount limit:", err);
      } finally {
        setIsDiscountLimitLoading(false);
      }
    };

    fetchDiscountLimit();
  }, []);

  // Load reservation, customer, and room data
  useEffect(() => {
    const fetchReservationData = async () => {
      if (!id) return;

      try {
        if (!reservation) {
          const res = await axios.get(`${Url}/Admin/Reservation/Get/?id=${id}`);
          setReservation(res.data);
          if (res.data?.customerId) {
            const customerRes = await axios.get(
              `${Url}/Admin/Customer/Get/?id=${res.data.customerId}`
            );
            setCustomer(customerRes.data);
          }
          if (res.data?.roomId) {
            const roomRes = await axios.get(
              `${Url}/Admin/Room/GetRoom/?id=${res.data.roomId}`
            );
            setRoom(roomRes.data);
          }
          // Set initial discount value from loaded reservation data
          setDiscountValue(res.data.discount || 0);
        }
      } catch (error) {
        toast.error("Failed to load reservation details.");
      }
    };
    fetchReservationData();
  }, [id, reservation]);

  // Handle existing images from reservation data
  useEffect(() => {
    if (!reservation) return;
    const imgsAny = (reservation as any).images ?? (reservation as any).Images;
    if (typeof imgsAny === "string" && imgsAny.trim().length > 0) {
      setExistingImages(
        imgsAny
          .split(",")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0)
      );
    } else {
      setExistingImages([]);
    }
  }, [reservation]);

  // Derived monetary calculations
  const originalTotal = reservation
    ? Number(reservation.paid || 0) + Number(reservation.dues || 0)
    : 0;

  const computedDiscountAmount = (() => {
    if (!originalTotal) return 0;
    if (discountMode === "percent") {
      const pct = clamp(discountValue, 0, discountLimit);
      return Math.round((pct / 100) * originalTotal * 100) / 100;
    } else {
      return clamp(discountValue, 0, originalTotal);
    }
  })();

  const totalAfterDiscount =
    Math.round(Math.max(0, originalTotal - computedDiscountAmount) * 100) / 100;
  const totalPaidSoFar = reservation ? Number(reservation.paid || 0) : 0;
  const totalPaidAfterThis =
    Math.round(
      (totalPaidSoFar + clamp(paymentNow, 0, Number.MAX_SAFE_INTEGER)) * 100
    ) / 100;
  const remainingAfter =
    Math.round((totalAfterDiscount - totalPaidAfterThis) * 100) / 100;
  const changeToReturn = remainingAfter < 0 ? Math.abs(remainingAfter) : 0;
  const remainingDue = remainingAfter >= 0 ? remainingAfter : 0;

  const format = (n: number) => n.toFixed(2);

  // Image upload handler with validation and previews
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (existingImages.length + newImages.length + files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed.`);
      e.target.value = "";
      return;
    }

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a supported image type.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(
          `${file.name} exceeds ${MAX_FILE_SIZE / (1024 * 1024)} MB.`
        );
        continue;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    if (validFiles.length > 0) {
      setNewImages((prev) => [...prev, ...validFiles]);
      setNewImagePreviews((prev) => [...prev, ...newPreviews]);
    }

    e.target.value = "";
  };

  // remove an existing image (URL) or a new image (file)
  const handleDeleteImage = (image: string | number) => {
    if (typeof image === "string") {
      setExistingImages((prev) => prev.filter((p) => p !== image));
    } else {
      const idx = image;
      setNewImages((prev) => prev.filter((_, i) => i !== idx));
      setNewImagePreviews((prevPre) => {
        const url = prevPre[idx];
        if (url) URL.revokeObjectURL(url);
        return prevPre.filter((_, i) => i !== idx);
      });
    }
  };

  // cleanup previews on unmount
  useEffect(() => {
    return () => {
      newImagePreviews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [newImagePreviews]);

  // Submit handler: send total paid (previous + now) & discount amount (money)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservation) return toast.error("Reservation not loaded");

    // Basic validation
    if (paymentNow < 0) return toast.error("Paid amount cannot be negative");
    if (
      discountMode === "percent" &&
      (discountValue < 0 || discountValue > discountLimit)
    )
      return toast.error(
        `Discount percent must be between 0 and ${discountLimit}%`
      );
    if (
      discountMode === "amount" &&
      (discountValue < 0 || discountValue > originalTotal)
    )
      return toast.error("Discount amount must be between 0 and the subtotal");

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("ReservationId", reservation.id.toString());
      formData.append("Paid", totalPaidAfterThis.toString());
      formData.append("Discount", computedDiscountAmount.toString());

      newImages.forEach((f) => formData.append("uploadedFiles", f));

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
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow-lg"
      >
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Check-In Guest
        </h1>
        <p className="text-center text-gray-500 mb-6">
          Complete the check-in process for the reservation.
        </p>

        {/* Reservation Details */}
        <section className="p-5 border border-gray-200 rounded-xl space-y-4 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">
            Reservation & Guest Information
          </h2>
          {reservation ? (
            <div className="grid md:grid-cols-2 gap-5">
              {/* Customer Details */}
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
                      {customer.phoneNumber}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">Loading customer...</p>
                )}
              </div>
              {/* Room Details */}
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

        {/* Financials Summary */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mt-6">
          <div className="p-4 bg-blue-50 rounded-lg shadow-sm border border-blue-200">
            <p className="text-sm text-blue-700">Subtotal</p>
            <p className="text-2xl font-bold text-blue-900">
              {format(originalTotal)}
            </p>
            <p className="text-xs text-blue-500">
              (Previous Paid + Original Dues)
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg shadow-sm border border-yellow-200">
            <p className="text-sm text-yellow-700">Previously Paid</p>
            <p className="text-2xl font-bold text-yellow-900">
              {format(totalPaidSoFar)}
            </p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg shadow-sm border border-red-200">
            <p className="text-sm text-red-700">Original Dues</p>
            <p className="text-2xl font-bold text-red-900">
              {format(reservation?.dues || 0)}
            </p>
          </div>
        </section>

        {/* Payment & Discount Inputs */}
        <section className="p-5 border border-gray-200 rounded-xl space-y-4 mt-6">
          <h2 className="text-xl font-semibold text-gray-700">
            Payment & Discount
          </h2>

          <div className="space-y-2">
            <label htmlFor="payment-now" className="font-medium block">
              Amount to Pay Now
            </label>
            <Input
              id="payment-now"
              type="number"
              min={0}
              step="10"
              value={paymentNow}
              onChange={(e) =>
                setPaymentNow(
                  Number(
                    Number(e.target.value) > originalTotal
                      ? originalTotal
                      : e.target.value || 0
                  )
                )
              }
              className="rounded-lg"
            />
            <p className="text-sm text-gray-500">
              Enter the amount received from the customer at this time.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-medium">Discount</h3>
            <p className="text-sm text-gray-500">
              {isDiscountLimitLoading
                ? "Loading discount limit..."
                : `Your maximum discount limit is ${discountLimit}%.`}
            </p>
            <div className="flex gap-4 mb-2 items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="discountMode"
                  checked={discountMode === "amount"}
                  onChange={() => setDiscountMode("amount")}
                  className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                />
                <span>By Amount (EGP)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="discountMode"
                  checked={discountMode === "percent"}
                  onChange={() => setDiscountMode("percent")}
                  className="form-radio h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                />
                <span>By Percentage (%)</span>
              </label>
            </div>

            {discountMode === "percent" ? (
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={discountLimit}
                  value={clamp(discountValue, 0, discountLimit)}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  disabled={isDiscountLimitLoading}
                />
                <Input
                  type="number"
                  min={0}
                  max={discountLimit}
                  step="1"
                  value={clamp(discountValue, 0, discountLimit)}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className="w-20 rounded-lg"
                  disabled={isDiscountLimitLoading}
                />
                <span className="text-lg font-semibold">%</span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={0}
                  max={originalTotal}
                  step="0.01"
                  value={discountValue}
                  // In the amount mode input section, change to:
                  onChange={(e) =>
                    setDiscountValue(
                      Number(
                        Number(e.target.value) >
                          (originalTotal * discountLimit) / 100
                          ? (originalTotal * discountLimit) / 100
                          : e.target.value || 0
                      )
                    )
                  }
                  className="w-full rounded-lg"
                />
                <span className="text-lg font-semibold">EGP</span>
              </div>
            )}
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
              EGP {format(originalTotal)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm text-red-600 mb-2">
            <span className="font-medium">Discount Applied:</span>
            <span className="font-mono">
              - EGP {format(computedDiscountAmount)}
            </span>
          </div>
          <hr className="border-gray-300 mb-2" />
          <div className="flex justify-between items-center text-lg font-bold text-gray-900 mb-4">
            <span>Total After Discount:</span>
            <span>EGP {format(totalAfterDiscount)}</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Total Paid (Previous + Now):
              </span>
              <span className="font-mono text-gray-800">
                EGP {format(totalPaidAfterThis)}
              </span>
            </div>
            <div className="flex justify-between items-center text-lg font-semibold">
              <span className="text-gray-600">Remaining Due:</span>
              <span
                className={`font-mono ${
                  remainingDue === 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                EGP {remainingDue > 0 ? format(remainingDue) : "0.00"}
              </span>
            </div>
            {changeToReturn > 0 && (
              <div className="text-sm text-center text-green-600 font-bold mt-2">
                Change to Return: EGP {format(changeToReturn)}
              </div>
            )}
          </div>
        </section>

        {/* Proof of Payment Images */}
        <section className="space-y-4 mt-6">
          <h2 className="text-xl font-semibold text-gray-700">
            Proof of Payment Images
          </h2>
          <p className="text-gray-500 text-sm">
            Upload up to {MAX_IMAGES} images (max{" "}
            {MAX_FILE_SIZE / (1024 * 1024)}MB each) as proof of payment.
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
          {(existingImages.length > 0 || newImagePreviews.length > 0) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {existingImages.map((url, idx) => (
                <div key={`existing-${idx}`} className="relative group">
                  <img
                    src={url}
                    alt={`Existing ${idx}`}
                    className="w-full h-28 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(url)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {newImagePreviews.map((preview, idx) => (
                <div key={`new-${idx}`} className="relative group">
                  <img
                    src={preview}
                    alt={`New ${idx}`}
                    className="w-full h-28 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={saving}
          className="w-full text-lg py-3 rounded-l mt-6 cursor-pointer font-sans"
        >
          {saving ? "Processing Check-In..." : "Submit Check-In"}
        </Button>
      </form>
    </>
  );
}
