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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Toaster, toast } from "sonner";

type Customer = {
  id: number;
  name: string;
  identificationNumber: string;
};

function Booking() {
  const location = useLocation();
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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  const formatDateTimeLocal = (date: Date | string | undefined) => {
    if (!date) return "";
    const d = new Date(date);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
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
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    };

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
      } else {
        const msg = await res.text();
        toast.error(msg);
      }
    } catch (err: any) {
      toast.error(
        err.message || "Something went wrong while creating reservation"
      );
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
              <Label htmlFor="checkIn">Check-in</Label>
              <input
                id="checkIn"
                type="datetime-local"
                value={formatDateTimeLocal(checkInDate)}
                readOnly
                className="border p-2 w-full rounded bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <Label htmlFor="checkOut">Check-out</Label>
              <input
                id="checkOut"
                type="datetime-local"
                value={formatDateTimeLocal(checkOutDate)}
                readOnly
                className="border p-2 w-full rounded bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Customer</Label>
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
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white cursor-pointer"
          >
            Confirm Booking
          </Button>
        </form>
      </div>
    </>
  );
}

export default Booking;
