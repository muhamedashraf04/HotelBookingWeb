"use client";

import Header from "@/components/Header/Header";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
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
};


function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomNumber, roomType, checkIn, checkOut, roomId } =
    location.state || {};

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [checkInDate] = useState(checkIn || "");
  const [checkOutDate] = useState(checkOut || "");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [extraBeds, setExtraBeds] = useState(0);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [marriageCertificateFile, setMarriageCertificateFile] = useState<File | null>(null);
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);


  // --- Create customer popup ---
  const [createOpen, setCreateOpen] = useState(false);
  const [identificationFile, setIdentificationFile] = useState<File | null>(
    null
  );
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
  });
  const [isCreating, setIsCreating] = useState(false);

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
      const res = await fetch(
        "http://localhost:5002/Admin/Customer/GetCustomers"
      );
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      setCustomers(data);
    } catch (err: any) {
      toast.error(
        err.message || "Something went wrong while fetching customers"
      );
    }
  };

  useEffect(() => {
    fetchCustomers();
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
          headers: { "Content-Type": "application/json" },
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

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCreating) return;

    if (!identificationFile) {
      toast.error("Identification file is required");
      setIsCreating(false);
      return;
    }
    if (newCustomer.isMarried && !marriageCertificateFile) {
      toast.error("Marriage certificate is required for married customers");
      setIsCreating(false);
      return;
    }

    setIsCreating(true);
    try {
      const customerFormData = new FormData();

      // 👇 Must prefix with "customer."
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
      customerFormData.append("customer.IsMarried", String(newCustomer.isMarried));
      customerFormData.append(
        "customer.IdentificationNumber",
        newCustomer.identificationNumber
      );

      if (identificationFile) {
        customerFormData.append("IdentificationFile", identificationFile);
      }
      if (marriageCertificateFile) {
        customerFormData.append("MarriageCertificate", marriageCertificateFile);
      }

      await axios.post(
        "http://localhost:5002/Admin/Customer/Register",
        customerFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Customer registered successfully!");
      setCreateOpen(false);

      // Reset
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
      });
      setIdentificationFile(null);
      setMarriageCertificateFile(null);

      await fetchCustomers();
    } catch (err: any) {
      toast.error(err?.response?.data ?? "Failed to register customer");
    } finally {
      setIsCreating(false);
    }
  };


  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
        <Toaster richColors />
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
              <Label>Name</Label>
              <Input
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newCustomer.email ?? ""}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                value={newCustomer.phoneNumber ?? ""}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Nationality</Label>
              <Select
                onValueChange={(value) =>
                  setNewCustomer((prev) => ({ ...prev, nationality: value }))
                }
                value={newCustomer.nationality}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto" position="popper">
                  {sortedNationalities.map((nat, idx) => (
                    <SelectItem
                      key={idx}
                      value={nat}

                      onPointerMove={(e) => e.preventDefault()}
                    >
                      {nat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="pl-1" htmlFor="IdentificationType">
                Identification Type
              </Label>
              <Select
                value={newCustomer.identificationType}
                onValueChange={(value) =>
                  setNewCustomer({ ...newCustomer, identificationType: value })
                }>
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
            </div>
            <div>
              <Label className="">Identification Number</Label>
              <Input
                value={newCustomer.identificationNumber ?? ""}
                onChange={(e) =>
                  setNewCustomer({
                    ...newCustomer,
                    identificationNumber: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                value={newCustomer.address ?? ""}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, address: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="pl-1" htmlFor="BirthDate">
                Birth Date
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

                        setBirthDate(date);
                        setNewCustomer({
                          ...newCustomer,
                          birthDate: date.toISOString().split("T")[0],
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


            {/* ✅ File uploads */}
            <div>
              <Label>Identification File</Label>
              <Input
                type="file"
                onChange={(e) =>
                  setIdentificationFile(e.target.files ? e.target.files[0] : null)
                }
              />
            </div>

            {newCustomer.isMarried && (
              <div>
                <Label>Marriage Certificate</Label>
                <Input
                  type="file"
                  onChange={(e) =>
                    setMarriageCertificateFile(
                      e.target.files ? e.target.files[0] : null
                    )
                  }
                />
              </div>
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
      </Dialog >
    </>
  );
}

export default Booking;
