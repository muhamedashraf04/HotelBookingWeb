"use client";

import axiosInstance from "@/AxiosInstance.tsx";
import Header from "@/components/Header/Header";
import { parseTokenRoleAndUser } from "@/components/Header/Nav";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { Url } from "../../GlobalVariables";
import Cookies from "js-cookie";
import { Check, ChevronsUpDown, Plus, Upload } from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import countries from "world-countries";

type Customer = {
  id: number;
  name: string;
  birthDate: string;
  email: string;
  nationality: string;
  address: string;
  phoneNumber: string;
  identificationType: string;
  identificationNumber: string;
  isMarried: boolean;
  identificationAttachment: string | null;
  marriageCertificateAttachment: string | null;
};

function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomNumber, roomType, checkIn, checkOut, roomId } =
    location.state || {};

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [checkInDate] = useState(checkIn || "");
  const [checkOutDate] = useState(checkOut || "");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [extraBeds, setExtraBeds] = useState(0);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const idFileInputRef = useRef<HTMLInputElement>(null);
  const marFileInputRef = useRef<HTMLInputElement>(null);

  const [IDexistingImages, setIDExistingImages] = useState<string[]>([]);
  const [IDnewImages, setIDNewImages] = useState<File[]>([]);
  const [IDdeletedImages, setIDDeletedImages] = useState<string[]>([]);

  const [MARexistingImages, setMARExistingImages] = useState<string[]>([]);
  const [MARnewImages, setMARNewImages] = useState<File[]>([]);
  const [MARdeletedImages, setMARDeletedImages] = useState<string[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);

  const [createOpen, setCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Customer>({
    id: 0,
    name: "",
    birthDate: "",
    email: "",
    nationality: "",
    address: "",
    phoneNumber: "",
    identificationType: "",
    identificationNumber: "",
    isMarried: false,
    identificationAttachment: null,
    marriageCertificateAttachment: null,
  });

  const formatDateTimeLocal = (date: Date | string | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(
      d.getUTCDate()
    )}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  };
  const nationalities = countries.map((c) => ({
    country: c.name.common,
    nationality: c.demonyms?.eng?.m || c.name.common,
  }));
  const sortedNationalities = [...nationalities]
    .map((n) => n.nationality)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort((a, b) => a.localeCompare(b));

  const fetchCustomers = async () => {
    try {
      const customersRes = await axiosInstance.get(
        `${Url}/Admin/Customer/GetCustomers`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      if (customersRes.status !== 200) {
        throw new Error("Failed to fetch customers");
      }

      // ✅ Use the data property directly
      setCustomers(customersRes.data);
    } catch (err: any) {
      toast.error(
        err.message || "Something went wrong while fetching customers"
      );
    }
  };


  useEffect(() => {
    fetchCustomers();
    setIDExistingImages(
      typeof newCustomer.identificationAttachment === "string" &&
        newCustomer.identificationAttachment.trim().length > 0
        ? newCustomer.identificationAttachment
          .split(",")
          .map((img: string) => img.trim())
          .filter((img: string) => img.length > 0)
        : []
    );
    setMARExistingImages(
      typeof newCustomer.marriageCertificateAttachment === "string" &&
        newCustomer.marriageCertificateAttachment.trim().length > 0
        ? newCustomer.marriageCertificateAttachment
          .split(",")
          .map((img: string) => img.trim())
          .filter((img: string) => img.length > 0)
        : []
    );
  }, []);
  useEffect(() => {
    const token = Cookies.get("token");
    const { role } = parseTokenRoleAndUser(token);

    if (!(role === "Admin" || role === "Receptionist")) {
      navigate("/login");
    }
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!customerId) {
      toast.error("Please select a customer");
      return;
    }
    const reservation = {
      customerId,
      roomId,
      roomType,
      checkInDate: new Date(checkInDate),
      checkOutDate: new Date(checkOutDate),
      numberOfAdults: adults,
      numberOfChildren: children,
      numberOfExtraBeds: extraBeds,
      status: "Reserved",
    };

    setIsSubmitting(true);
    try {
      const res = await fetch(
        "http://localhost:5002/Admin/Reservation/Create",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${Cookies.get("token")}`, },

          body: JSON.stringify(reservation),
        }
      );

      if (res.ok) {
        toast.success("Reservation created successfully!");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        const msg = await res.text();
        toast.error(msg);
      }
    } catch (err: any) {
      toast.error(
        err.message || "Something went wrong while creating reservation"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];

    if (IDexistingImages.length + IDnewImages.length + files.length > 5) {
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
      setIDNewImages((prev) => [...prev, ...validFiles]);
    }
    e.target.value = "";
  };
  const handleMARImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];

    if (MARexistingImages.length + MARnewImages.length + files.length > 5) {
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
      setMARNewImages((prev) => [...prev, ...validFiles]);
    }
    e.target.value = "";
  };

  const handleDeleteImage = (image: string | File, type: "ID" | "MAR") => {
    if (type === "ID") {
      if (typeof image === "string") {
        setIDExistingImages((prev) => prev.filter((img) => img !== image));
        setIDDeletedImages((prev) => [...prev, image]);
      } else {
        setIDNewImages((prev) => prev.filter((file) => file !== image));
      }
    } else if (type === "MAR") {
      if (typeof image === "string") {
        setMARExistingImages((prev) => prev.filter((img) => img !== image));
        setMARDeletedImages((prev) => [...prev, image]);
      } else {
        setMARNewImages((prev) => prev.filter((file) => file !== image));
      }
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;
    const newErrors: { [key: string]: string } = {};

    if (!newCustomer.name.trim()) newErrors.name = "Name is required";
    if (!newCustomer.email.trim()) newErrors.email = "Email is required";
    if (!newCustomer.identificationType)
      newErrors.identificationType = "ID type is required";
    if (!newCustomer.identificationNumber.trim())
      newErrors.identificationNumber = "ID number is required";
    if (!newCustomer.phoneNumber.trim())
      newErrors.phoneNumber = "Phone number is required";
    if (!newCustomer.nationality.trim())
      newErrors.nationality = "Nationality is required";
    if (IDnewImages.length === 0)
      newErrors.identificationFiles = "At least one ID file is required";
    if (newCustomer.isMarried && MARnewImages.length === 0)
      newErrors.marriageFiles = "Marriage certificate is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields");
      return;
    }
    setErrors({});
    setIsCreating(true);
    try {
      const customerFormData = new FormData();

      customerFormData.append("customer.Name", newCustomer.name);
      customerFormData.append("customer.BirthDate", newCustomer.birthDate);
      customerFormData.append("customer.Email", newCustomer.email);
      customerFormData.append("customer.Nationality", newCustomer.nationality);
      customerFormData.append("customer.Address", newCustomer.address);
      customerFormData.append("customer.PhoneNumber", newCustomer.phoneNumber);
      customerFormData.append(
        "customer.IdentificationType",
        newCustomer.identificationType
      );
      customerFormData.append(
        "customer.IsMarried",
        String(newCustomer.isMarried)
      );
      customerFormData.append(
        "customer.IdentificationNumber",
        newCustomer.identificationNumber
      );

      IDnewImages.forEach((file) => {
        customerFormData.append("IdentificationFile", file);
      });

      if (newCustomer.isMarried) {
        MARnewImages.forEach((file) => {
          customerFormData.append("MarriageCertificate", file);
        });
      }

      await axiosInstance.post(
        "http://localhost:5002/Admin/Customer/Register",
        customerFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },


        }
      );

      toast.success("Customer registered successfully!");
      setCreateOpen(false);

      setNewCustomer({
        id: 0,
        name: "",
        birthDate: "",
        email: "",
        nationality: "",
        address: "",
        phoneNumber: "",
        identificationType: "",
        identificationNumber: "",
        isMarried: false,
        identificationAttachment: null,
        marriageCertificateAttachment: null,
      });
      setIDNewImages([]);
      setMARNewImages([]);

      await fetchCustomers();
    } catch (err: any) {
      toast.error(err?.response?.data);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6 rounded-lg border p-6 shadow-md bg-white"
        >
          <h1 className="text-2xl font-bold text-center">Booking</h1>
          <p className="text-sm text-gray-500 text-center">
            Complete the booking details below
          </p>

          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Room:</strong> {roomNumber}
            </p>
            <p className="text-gray-700">
              <strong>Type:</strong> {roomType}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label id="checkInLabel" htmlFor="checkIn">
                Check-in
              </Label>
              <input
                id="checkIn"
                type="datetime-local"
                value={formatDateTimeLocal(checkInDate)}
                readOnly
                aria-labelledby="checkInLabel"
                className="border p-2 w-full rounded bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <Label id="checkOutLabel" htmlFor="checkOut">
                Check-out
              </Label>
              <input
                id="checkOut"
                type="datetime-local"
                value={formatDateTimeLocal(checkOutDate)}
                readOnly
                aria-labelledby="checkOutLabel"
                className="border p-2 w-full rounded bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <Label>Customer</Label>
              </div>
              <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={customerOpen}
                    className="w-full justify-between"
                  >
                    {selectedCustomer
                      ? `${selectedCustomer.name} | ID: ${selectedCustomer.identificationNumber}`
                      : "Select customer"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search customer..." />
                    <CommandList>
                      <CommandEmpty>No customer found.</CommandEmpty>
                      <CommandGroup>
                        {customers.map((c) => (
                          <CommandItem
                            key={c.id}
                            value={`${c.name} ${c.identificationNumber}`}
                            onSelect={() => {
                              setSelectedCustomer(c);
                              setCustomerId(c.id);
                              setCustomerOpen(false);
                            }}
                          >
                            {c.name} | ID: {c.identificationNumber}
                            <Check
                              className={cn(
                                "ml-auto",
                                selectedCustomer?.id === c.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="flex justify-between items-center"
              onClick={() => setCreateOpen(true)}
              type="button"
            >
              <Plus className="h-4 w-4 mr-1" /> New Customer
            </Button>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="adults">Adults</Label>
                <input
                  id="adults"
                  type="number"
                  min="1"
                  max="3"
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="border p-2 w-full rounded"
                />
              </div>
              <div>
                <Label htmlFor="children">Children</Label>
                <input
                  id="children"
                  type="number"
                  min="0"
                  max="5"
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                  className="border p-2 w-full rounded"
                />
              </div>
              <div>
                <Label htmlFor="extraBeds">Extra Beds</Label>
                <input
                  id="extraBeds"
                  type="number"
                  min="0"
                  max="2"
                  value={extraBeds}
                  onChange={(e) => setExtraBeds(Number(e.target.value))}
                  className="border p-2 w-full rounded"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
          >
            Confirm Booking
          </Button>
        </form>
      </div>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create New Customer</DialogTitle>
          </DialogHeader>

          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            onSubmit={handleCreateCustomer}
          >
            <div>
              <Label>Name *</Label>
              <Input
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name}</p>
              )}
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={newCustomer.email ?? ""}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            <div>
              <Label>Phone Number *</Label>
              <Input
                value={newCustomer.phoneNumber ?? ""}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    phoneNumber: e.target.value,
                  })
                }
                className={errors.phoneNumber ? "border-red-500" : ""}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
              )}
            </div>
            <div>
              <Label>Nationality *</Label>
              <Select
                onValueChange={(value) =>
                  setNewCustomer((prev) => ({ ...prev, nationality: value }))
                }
                value={newCustomer.nationality}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent className="max-h-60" position="popper">
                  {sortedNationalities.map((nat, idx) => (
                    <SelectItem key={idx} value={nat}>
                      {nat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.nationality && (
                <p className="text-red-500 text-sm">{errors.nationality}</p>
              )}
            </div>
            <div>
              <Label className="pl-1" htmlFor="IdentificationType">
                Identification Type *
              </Label>
              <Select
                value={newCustomer.identificationType}
                onValueChange={(value) =>
                  setNewCustomer({ ...newCustomer, identificationType: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="ID">ID</SelectItem>
                    <SelectItem value="Passport">Passport</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.identificationType && (
                <p className="text-red-500 text-sm">
                  {errors.identificationType}
                </p>
              )}
            </div>
            <div>
              <Label>Identification Number *</Label>
              <Input
                value={newCustomer.identificationNumber ?? ""}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    identificationNumber: e.target.value,
                  })
                }
                className={errors.identificationNumber ? "border-red-500" : ""}
              />
              {errors.identificationNumber && (
                <p className="text-red-500 text-sm">
                  {errors.identificationNumber}
                </p>
              )}
            </div>
            <div>
              <Label>Address (optional)</Label>
              <Input
                value={newCustomer.address ?? ""}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, address: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="pl-1" htmlFor="BirthDate">
                Birth Date *
              </Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {birthDate ? (
                      format(birthDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <div className="space-y-2">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      selected={birthDate}
                      onSelect={(date) => {
                        if (!date) return;

                        // Format as YYYY-MM-DD in local timezone
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(
                          2,
                          "0"
                        );
                        const day = String(date.getDate()).padStart(2, "0");
                        const formatted = `${year}-${month}-${day}`;

                        setBirthDate(date);
                        setNewCustomer({
                          ...newCustomer,
                          birthDate: formatted,
                        });
                        setIsCalendarOpen(false);
                      }}
                      disabled={(date) => {
                        const today = new Date();

                        // Latest allowed date = today minus 18 years
                        const latestValid = new Date(
                          today.getFullYear() - 18,
                          today.getMonth(),
                          today.getDate()
                        );
                        return date > today || date > latestValid;
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="md:col-span-2">
              <Label>Marriage Status</Label>
              <div className="flex items-center gap-4 mt-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="IsMarried"
                    checked={newCustomer.isMarried === true}
                    onChange={() =>
                      setNewCustomer({
                        ...newCustomer,
                        isMarried: true,
                      })
                    }
                  />
                  Married
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="IsMarried"
                    checked={newCustomer.isMarried === false}
                    onChange={() =>
                      setNewCustomer({
                        ...newCustomer,
                        isMarried: false,
                      })
                    }
                  />
                  Single
                </label>
              </div>
            </div>

            {/* File uploads */}
            <div
              onClick={() => idFileInputRef.current?.click()}
              className="flex items-center justify-between border-2 border-dashed border-gray-300 rounded-lg px-4 py-2 cursor-pointer w-50"
            >
              <Label className="text-sm text-gray-600">
                Identification File
              </Label>
              <Upload className="w-5 h-5 text-gray-500" />

              <input
                ref={idFileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleIdImageUpload}
                className="hidden"
              />
            </div>
            {/* Preview List */}
            <div className="flex flex-wrap gap-2">
              {[...IDexistingImages, ...IDnewImages].map((img, index) => (
                <div
                  key={index}
                  className="relative w-20 h-20 border rounded overflow-hidden"
                >
                  <img
                    src={
                      typeof img === "string" ? img : URL.createObjectURL(img)
                    }
                    alt="preview"
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img, "ID")}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            {newCustomer.isMarried && (
              <>
                <div
                  onClick={() => marFileInputRef.current?.click()}
                  className="flex items-center justify-between border-2 border-dashed border-gray-300 rounded-lg px-4 py-2 cursor-pointer w-50"
                >
                  <Label className="text-sm text-gray-600">
                    Marriage Certificate
                  </Label>
                  <Upload className="w-5 h-5 text-gray-500" />
                  <input
                    ref={marFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMARImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Preview List */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {[...MARexistingImages, ...MARnewImages].map((img, index) => (
                    <div
                      key={index}
                      className="relative w-20 h-20 border rounded overflow-hidden"
                    >
                      <img
                        src={
                          typeof img === "string"
                            ? img
                            : URL.createObjectURL(img)
                        }
                        alt="preview"
                        className="object-cover w-full h-full"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(img, "MAR");
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            <DialogFooter className="block">
              <div className="grid grid-cols-2 gap-4 mt-4">
                <Button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating} className="w-full">
                  {isCreating ? "Creating..." : "Create"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Booking;
