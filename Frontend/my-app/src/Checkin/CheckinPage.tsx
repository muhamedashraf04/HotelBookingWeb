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
  const [paymentNow, setPaymentNow] = useState<number>(0); // amount paid at this check-in
  const [discountMode, setDiscountMode] = useState<"amount" | "percent">(
    "amount"
  );
  const [discountValue, setDiscountValue] = useState<number>(0); // amount or percent depending on mode

  // Images
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const MAX_IMAGES = 5;

  // Load reservation if not passed through navigation
  useEffect(() => {
    if (!reservation && id) {
      axios
        .get(`${Url}/Admin/Reservation/Get/?id=${id}`)
        .then((res) => setReservation(res.data))
        .catch(() => toast.error("Failed to load reservation"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Load customer and room once reservation is available
  useEffect(() => {
    if (reservation?.customerId) {
      axios
        .get(`${Url}/Admin/Customer/Get/?id=${reservation.customerId}`)
        .then((res) => setCustomer(res.data))
        .catch(() => toast.error("Failed to load customer"));
    }
  }, [reservation?.customerId]);

  useEffect(() => {
    if (reservation?.roomId) {
      axios
        .get(`${Url}/Admin/Room/GetRoom/?id=${reservation.roomId}`)
        .then((res) => setRoom(res.data))
        .catch(() => toast.error("Failed to load room"));
    }
  }, [reservation?.roomId]);

  // If reservation contains existing images, set them
  useEffect(() => {
    if (!reservation) return;
    // reservation may provide images field; try to use `images` or `Images`
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

    // If reservation has a previous discount, default UI to show that as amount (not overwriting)
    setDiscountValue(reservation.discount || 0);
    // reset paymentNow (we will compute totalPaidToSend on submit)
    setPaymentNow(0);
  }, [reservation]);

  // Derived monetary calculations (assume original total = paid + dues)
  const originalTotal = reservation
    ? Number(reservation.paid || 0) + Number(reservation.dues || 0)
    : 0;

  const clamp = (v: number, min: number, max: number) =>
    Math.min(Math.max(Number.isFinite(v) ? v : 0, min), max);

  const computedDiscountAmount = (() => {
    if (!originalTotal) return 0;
    if (discountMode === "percent") {
      const pct = clamp(discountValue, 0, 100);
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
      toast.error(`Maximum ${MAX_IMAGES} images allowed`);
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
    // if string => existingImages index, if number => index in newImages
    if (typeof image === "string") {
      setExistingImages((prev) => prev.filter((p) => p !== image));
    } else {
      const idx = image;
      setNewImages((prev) => {
        const removed = prev[idx];
        // revoke preview url
        setNewImagePreviews((prevPre) => {
          const url = prevPre[idx];
          if (url) URL.revokeObjectURL(url);
          return prevPre.filter((_, i) => i !== idx);
        });
        return prev.filter((_, i) => i !== idx);
      });
    }
  };

  // cleanup previews on unmount
  useEffect(() => {
    return () => {
      newImagePreviews.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Submit handler: send total paid (previous + now) & discount amount (money)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservation) return toast.error("Reservation not loaded");

    // Basic validation
    if (paymentNow < 0) return toast.error("Paid amount cannot be negative");
    if (
      discountMode === "percent" &&
      (discountValue < 0 || discountValue > 100)
    )
      return toast.error("Discount percent must be between 0 and 100");
    if (
      discountMode === "amount" &&
      (discountValue < 0 || discountValue > originalTotal)
    )
      return toast.error("Discount amount must be between 0 and subtotal");

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("ReservationId", reservation.id.toString());

      // total paid to send (previous paid + paymentNow)
      const totalPaidToSend = totalPaidAfterThis;
      // discount to send (money)
      const discountToSend = computedDiscountAmount;

      formData.append("Paid", totalPaidToSend.toString());
      formData.append("Discount", discountToSend.toString());

      // append files
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
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Check-In</h1>

        {reservation ? (
          <div className="p-4 border rounded space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-bold">Customer</h3>
                {customer ? (
                  <div className="ml-2">
                    <p>Name: {customer.name}</p>
                    <p>Email: {customer.email}</p>
                    <p>ID: {customer.identificationNumber}</p>
                    <p>Phone: {customer.phone}</p>
                  </div>
                ) : (
                  <p>Loading customer...</p>
                )}
              </div>

              <div>
                <h3 className="font-bold">Room</h3>
                {room ? (
                  <div className="ml-2">
                    <p>Room Number: {room.roomNumber}</p>
                    <p>Type: {room.roomType}</p>
                    <p>Floor: {room.floor}</p>
                  </div>
                ) : (
                  <p>Loading room...</p>
                )}
              </div>
            </div>

            <p>
              <strong>Dates:</strong>{" "}
              {new Date(reservation.checkInDate).toLocaleString()} →{" "}
              {new Date(reservation.checkOutDate).toLocaleString()}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-muted-foreground">Subtotal</div>
                <div className="text-lg font-semibold">
                  {format(originalTotal)}
                </div>
                <div className="text-xs text-muted-foreground">
                  (Paid + Dues)
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-muted-foreground">
                  Previously Paid
                </div>
                <div className="text-lg font-semibold">
                  {format(totalPaidSoFar)}
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded">
                <div className="text-sm text-muted-foreground">
                  Original Dues
                </div>
                <div className="text-lg font-semibold">
                  {format(reservation.dues)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>Loading reservation...</p>
        )}

        {/* Payment & Discount controls */}
        <div className="p-4 border rounded space-y-4">
          <h3 className="font-bold">Payment & Discount</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="block mb-2 font-medium">Amount to pay now</span>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={paymentNow}
                onChange={(e) => setPaymentNow(Number(e.target.value || 0))}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Enter the cash/card amount collected at check-in.
              </div>
            </label>

            <div>
              <span className="block mb-2 font-medium">Discount</span>

              <div className="flex gap-2 items-center mb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="discountMode"
                    checked={discountMode === "amount"}
                    onChange={() => {
                      setDiscountMode("amount");
                      // if switching from percent to amount, try to keep monetary equivalent
                      if (reservation) {
                        const percentToAmount =
                          (discountValue / 100) * originalTotal;
                        setDiscountValue(
                          Math.round(percentToAmount * 100) / 100
                        );
                      } else {
                        setDiscountValue(0);
                      }
                    }}
                  />
                  <span>By amount</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="discountMode"
                    checked={discountMode === "percent"}
                    onChange={() => {
                      setDiscountMode("percent");
                      if (reservation) {
                        const amountToPercent = originalTotal
                          ? (discountValue / originalTotal) * 100
                          : 0;
                        setDiscountValue(
                          Math.round(amountToPercent * 100) / 100
                        );
                      } else {
                        setDiscountValue(0);
                      }
                    }}
                  />
                  <span>By percentage</span>
                </label>
              </div>

              {discountMode === "percent" ? (
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={clamp(discountValue, 0, 100)}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full"
                  />
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={clamp(discountValue, 0, 100)}
                    onChange={(e) =>
                      setDiscountValue(
                        clamp(Number(e.target.value || 0), 0, 100)
                      )
                    }
                    className="w-20"
                  />
                  <span className="text-sm">%</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={originalTotal}
                    step="0.01"
                    value={clamp(discountValue, 0, originalTotal)}
                    onChange={(e) =>
                      setDiscountValue(
                        clamp(Number(e.target.value || 0), 0, originalTotal)
                      )
                    }
                    className="w-full"
                  />
                  <span className="text-sm">currency</span>
                </div>
              )}

              <div className="text-xs text-muted-foreground mt-2">
                Discount will be applied to the subtotal. Shown below as a
                monetary value.
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <div className="flex justify-between">
              <div>Subtotal</div>
              <div>{format(originalTotal)}</div>
            </div>
            <div className="flex justify-between mt-1">
              <div>Discount</div>
              <div>- {format(computedDiscountAmount)}</div>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold">
              <div>Total after discount</div>
              <div>{format(totalAfterDiscount)}</div>
            </div>

            <div className="flex justify-between mt-2">
              <div>Paid now</div>
              <div>{format(clamp(paymentNow, 0, Number.MAX_SAFE_INTEGER))}</div>
            </div>

            <div className="flex justify-between mt-1">
              <div>Total paid (previous + now)</div>
              <div>{format(totalPaidAfterThis)}</div>
            </div>

            <div className="flex justify-between mt-2">
              <div>Remaining due</div>
              <div className={remainingDue === 0 ? "text-green-600" : ""}>
                {remainingDue > 0 ? format(remainingDue) : "0.00"}
              </div>
            </div>

            {changeToReturn > 0 && (
              <div className="mt-2 text-sm text-red-600">
                Change to return: {format(changeToReturn)}
              </div>
            )}
          </div>
        </div>

        {/* Proof of payment images */}
        <div className="space-y-3">
          <span className="block font-medium">
            Proof of Payment Images (max {MAX_IMAGES})
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

          {(existingImages.length > 0 || newImagePreviews.length > 0) && (
            <div className="grid grid-cols-3 gap-2">
              {existingImages.map((url, idx) => (
                <div key={`existing-${idx}`} className="relative">
                  <img
                    src={url}
                    alt={`Existing ${idx}`}
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

              {newImagePreviews.map((preview, idx) => (
                <div key={`new-${idx}`} className="relative">
                  <img
                    src={preview}
                    alt={`New ${idx}`}
                    className="w-full h-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(idx)}
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
