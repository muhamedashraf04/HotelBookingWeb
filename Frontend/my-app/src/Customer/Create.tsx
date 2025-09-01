
import Header from "@/components/Header/Header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { Url } from "../../GlobalVariables";
import countries from "world-countries";


// Define a type for your form data
type FormData = {
  Name: string;
  BirthDate: string;
  Email: string;
  Nationality: string;
  Address: string;
  PhoneNumber: string;
  IdentificationType: string;
  IdentificationNumber: string;
};

const Create = () => {
  // State to hold the form data
  const [formData, setFormData] = useState<FormData>({
    Name: "",
    BirthDate: "",
    Email: "",
    Nationality: "",
    Address: "",
    PhoneNumber: "",
    IdentificationType: "",
    IdentificationNumber: "",
  });

  const nationalities = countries.map((c) => ({
    country: c.name.common,
    nationality: c.demonyms?.eng?.m || c.name.common,
  }));
  const sortedNationalities = [...nationalities]
    .map((n) => n.nationality)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort((a, b) => a.localeCompare(b));


  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);

  // State to control the popover's open/closed state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // State to hold the uploaded file. It can be a File or null.
  const [identificationFile, setIdentificationFile] = useState<File | null>(
    null
  );

  // State to show a loading indicator
  const [isLoading, setIsLoading] = useState(false);

  // Use a useEffect hook to update formData.BirthDate whenever the birthDate state changes
  useEffect(() => {
    if (birthDate) {
      // Format the Date object to a YYYY-MM-DD string
      const formattedDate = format(birthDate, "yyyy-MM-dd");
      setFormData((prevData) => ({
        ...prevData,
        BirthDate: formattedDate,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        BirthDate: "",
      }));
    }
  }, [birthDate]);

  // Handle changes for all text inputs
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id as keyof FormData]: value,
    }));
  };

  // Dedicated handler for the shadcn Select component
  const handleIdentificationTypeChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      IdentificationType: value,
    }));
  };

  // Handle the file input change, using a type guard for safety
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIdentificationFile(e.target.files[0]);
    }
  };

  // Handle the form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formPayload = new FormData();
    // Use Object.keys with the FormData type to safely iterate
    (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
      // PREPEND the "customer." prefix to the key
      formPayload.append(`customer.${key}`, formData[key]);
    });

    if (identificationFile) {
      // The file key does not need the "customer." prefix
      formPayload.append("IdentificationFile", identificationFile);
    }

    try {
      const response = await fetch(`${Url}/Admin/Customer/Register`, {
        method: "POST",
        body: formPayload,
      });

      if (response.ok) {
        // Show success toast
        toast.success("Customer Added Successfully.", {
          description: "Redirecting...",
        });

        // Wait a moment before redirecting to allow the toast to show
        setTimeout(() => {
          window.location.href = "/app"; // Redirect to the app page
        }, 1500);
      } else {
        const errorData = await response.json();
        // Show error toast
        toast.error(
          `Error: ${errorData.message || "Something went wrong."} 😟`
        );
      }
    } catch (error) {
      // Show failure toast for network errors
      toast.error("Failed to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="min-h-screen flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="w-2xl space-y-6 rounded-lg border p-6 shadow-md"
        >
          <h1 className="text-2xl font-bold text-center">Register Customer</h1>
          <div className="space-y-4">
            <div>
              <Label className="pl-1 mb-2.5" htmlFor="Name">
                Name
              </Label>
              <Input
                id="Name"
                type="text"
                placeholder="Name"
                value={formData.Name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label className="pl-1 mb-2.5" htmlFor="BirthDate">
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

                  <Calendar
                    mode="single"
                    selected={birthDate}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      setBirthDate(date);
                      setIsCalendarOpen(false);
                    }}

                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label className="pl-1 mb-2.5" htmlFor="Email">
                Email
              </Label>
              <Input
                id="Email"
                type="email"
                placeholder="Email"
                value={formData.Email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label className="pl-1 mb-2.5" htmlFor="Nationality">
                Nationality
              </Label>
              <Select
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, Nationality: value }))
                }
                value={formData.Nationality}
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
              <Label className="pl-1 mb-2.5" htmlFor="Address">
                Address
              </Label>
              <Input
                id="Address"
                type="text"
                placeholder="Address"
                value={formData.Address}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label className="pl-1 mb-2.5" htmlFor="PhoneNumber">
                Phone Number
              </Label>
              <Input
                id="PhoneNumber"
                type="tel"
                placeholder="Phone Number"
                value={formData.PhoneNumber}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label className="pl-1 mb-2.5" htmlFor="IdentificationType">
                Identification Type
              </Label>
              <Select
                onValueChange={handleIdentificationTypeChange}
                value={formData.IdentificationType}
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
            </div>
            <div>
              <Label className="pl-1 mb-2.5" htmlFor="IdentificationNumber">
                Identification Number
              </Label>
              <Input
                id="IdentificationNumber"
                type="text"
                placeholder="Identification Number"
                value={formData.IdentificationNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label className="pl-1 mb-2.5" htmlFor="IdentificationFile">
                Identification File (Image)
              </Label>
              <Input
                id="IdentificationFile"
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                required
              />
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className={`w-full ${!isLoading ? "cursor-pointer" : "cursor-not-allowed"
                  }`}
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm Registration</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to register this customer?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-green-500 hover:bg-green-700 text-white cursor-pointer"
                  onClick={() => {
                    // Trigger the original handleSubmit manually
                    handleSubmit(
                      new Event(
                        "submit"
                      ) as unknown as FormEvent<HTMLFormElement>
                    );
                  }}
                >
                  Confirm
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </form>
        <Toaster richColors />{" "}
      </div>
    </>
  );
};

export default Create;
