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
import { cn } from "@/lib/utils"; // shadcn utility
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
  const [checkInDate, setCheckInDate] = useState(checkIn || "");
  const [checkOutDate, setCheckOutDate] = useState(checkOut || "");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [extraBeds, setExtraBeds] = useState(0);
  const [customerOpen, setCustomerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

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
      <div className="m-6 space-y-6">
        <Toaster />
        <h1 className="text-2xl font-bold text-center">Booking</h1>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <p>Room Number: {roomNumber}</p>
          <p>Type: {roomType}</p>

          <label className="block">
            Check-in:
            <input
              type="datetime-local"
              value={new Date(checkInDate).toISOString().slice(0, 16)}
              onChange={(e) => setCheckInDate(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          </label>

          <label className="block">
            Check-out:
            <input
              type="datetime-local"
              value={new Date(checkOutDate).toISOString().slice(0, 16)}
              onChange={(e) => setCheckOutDate(e.target.value)}
              className="border p-2 w-full rounded"
              required
            />
          </label>
          <div className="flex flex-col gap-2">
            <Label>Customer</Label>
            <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={customerOpen}
                  className="w-72 justify-between"
                >
                  {selectedCustomer
                    ? `${selectedCustomer.name} | ID: ${selectedCustomer.identificationNumber}`
                    : "Select customer"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-0">
                <Command>
                  <CommandInput
                    placeholder="Search customer..."
                    className="h-9"
                  />
                  <CommandList>
                    <CommandEmpty>No customer found.</CommandEmpty>
                    <CommandGroup>
                      {customers.map((c) => (
                        <CommandItem
                          key={c.id}
                          // 👇 put searchable text here
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
            <label>
              Adults
              <input
                type="number"
                min="1"
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="border p-2 w-full rounded"
              />
            </label>

            <label>
              Children
              <input
                type="number"
                min="0"
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
                className="border p-2 w-full rounded"
              />
            </label>

            <label>
              Extra Beds
              <input
                type="number"
                min="0"
                value={extraBeds}
                onChange={(e) => setExtraBeds(Number(e.target.value))}
                className="border p-2 w-full rounded"
              />
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-400 text-emerald-950 py-2 rounded hover:bg-emerald-500 cursor-pointer"
          >
            Confirm Booking
          </button>
        </form>
      </div>
    </>
  );
}

export default Booking;
