
import Header from "@/components/Header/Header";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

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
import { useNavigate } from "react-router-dom";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { Url } from "../../GlobalVariables";
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


const Create = () => {

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
  const navigate = useNavigate();
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const idFileInputRef = useRef<HTMLInputElement>(null);
  const marFileInputRef = useRef<HTMLInputElement>(null);

  const [IDexistingImages, setIDExistingImages] = useState<string[]>([]);
  const [IDnewImages, setIDNewImages] = useState<File[]>([]);
  const [IDdeletedImages, setIDDeletedImages] = useState<string[]>([]);

  const [MARexistingImages, setMARExistingImages] = useState<string[]>([]);
  const [MARnewImages, setMARNewImages] = useState<File[]>([]);
  const [MARdeletedImages, setMARDeletedImages] = useState<string[]>([]);

  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);

  const nationalities = countries.map((c) => ({
    country: c.name.common,
    nationality: c.demonyms?.eng?.m || c.name.common,
  }));
  const sortedNationalities = [...nationalities]
    .map((n) => n.nationality)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort((a, b) => a.localeCompare(b));

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});


  // Use a useEffect hook to update formData.BirthDate whenever the birthDate state changes
  useEffect(() => {
    setIDExistingImages(
      typeof newCustomer.identificationAttachment === "string" && newCustomer.identificationAttachment
        .trim().length > 0
        ? newCustomer.identificationAttachment
          .split(",")
          .map((img: string) => img.trim())
          .filter((img: string) => img.length > 0)
        : []
    );
    setMARExistingImages(
      typeof newCustomer.marriageCertificateAttachment === "string" && newCustomer.marriageCertificateAttachment
        .trim().length > 0
        ? newCustomer.marriageCertificateAttachment
          .split(",")
          .map((img: string) => img.trim())
          .filter((img: string) => img.length > 0)
        : []
    );
  }, []);



  const handleIdImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];

    if (IDexistingImages.length + IDnewImages.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image type.`);
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
        toast.error(`${file.name} is not a valid image type.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(` ${file.name} exceeds 5 MB.`);
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
    if (isLoading) return;


    const newErrors: { [key: string]: string } = {};

    if (!newCustomer.name.trim()) newErrors.name = "Name is required";
    if (!newCustomer.email.trim()) newErrors.email = "Email is required";
    if (!newCustomer.identificationType) newErrors.identificationType = "ID type is required";
    if (!newCustomer.identificationNumber.trim()) newErrors.identificationNumber = "ID number is required";
    if (!newCustomer.phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required";
    if (!newCustomer.nationality.trim()) newErrors.nationality = "Nationality is required";
    if (IDnewImages.length === 0) newErrors.identificationFiles = "At least one ID file is required";
    if (newCustomer.isMarried && MARnewImages.length === 0) newErrors.marriageFiles = "Marriage certificate is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields");
      return;
    }
    if (IDnewImages.length === 0) {
      toast.error("At least one Identification file is required");
      return;
    }
    if (newCustomer.isMarried && MARnewImages.length === 0) {
      toast.error("Marriage certificate is required for married customers");
      return;
    }

    setErrors({});
    setIsLoading(true);
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
      customerFormData.append("customer.IsMarried", String(newCustomer.isMarried));
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

      await axios.post(
        `${Url}/Admin/Customer/Register`,
        customerFormData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Customer registered successfully!");
      navigate("/");
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

    } catch (err: any) {
      toast.error(err?.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="min-h-screen flex items-center justify-center p-4">
        <form
          onSubmit={handleCreateCustomer}
          className="w-2xl space-y-6 rounded-lg border p-6 shadow-md"
        >
          <h1 className="text-2xl font-bold text-center">Register Customer</h1>
          <div className="space-y-4">
            <div>
              <Label className="pl-1 mb-2.5" htmlFor="Name">
                Name *
              </Label>
              <Input
                id="Name"
                type="text"
                placeholder="Name"
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>
            <div>
              <Label className="pl-1 mb-2.5" htmlFor="BirthDate">
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
                        const month = String(date.getMonth() + 1).padStart(2, "0");
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
            <div>
              <Label className="pl-1 mb-2.5" htmlFor="Email">
                Email *
              </Label>
              <Input
                id="Email"
                type="email"
                placeholder="Email"
                value={newCustomer.email}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, email: e.target.value })
                }
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            <div>
              <Label className="pl-1 mb-2.5" htmlFor="Nationality">
                Nationality *
              </Label>
              <Select
                onValueChange={(value) =>
                  setNewCustomer((prev) => ({ ...prev, nationality: value }))
                }
                value={newCustomer.nationality}
              >
                <SelectTrigger className="w-full ">
                  <SelectValue placeholder="Select nationality" />
                </SelectTrigger>
                <SelectContent className="max-h-60" position="popper">
                  {sortedNationalities.map((nat, idx) => (
                    <SelectItem
                      key={idx}
                      value={nat}
                    >
                      {nat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.nationality && <p className="text-red-500 text-sm">{errors.nationality}</p>}
            </div>
            <div>
              <Label className="pl-1 mb-2.5" htmlFor="Address">
                Address (Optional)
              </Label>
              <Input
                value={newCustomer.address ?? ""}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, address: e.target.value })
                }
              />
            </div>
            <div>
              <Label className="pl-1 mb-2.5" htmlFor="PhoneNumber">
                Phone Number *
              </Label>
              <Input
                value={newCustomer.phoneNumber ?? ""}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })
                }
                className={errors.phoneNumber ? "border-red-500" : ""}
              />
              {errors.phoneNumber && <p className="text-red-500 text-sm">{errors.phoneNumber}</p>}
            </div>
            <div>
              <Label className="pl-1 mb-2.5" htmlFor="IdentificationType">
                Identification Type *
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
              {errors.identificationType && <p className="text-red-500 text-sm">{errors.identificationType}</p>}            </div>
            <div>
              <Label className="pl-1 mb-2.5" htmlFor="IdentificationNumber">
                Identification Number *
              </Label>
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
              {errors.identificationNumber && <p className="text-red-500 text-sm">{errors.identificationNumber}</p>}
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

            {/* {images} */}
            <div
              onClick={() => idFileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded p-4 text-center cursor-pointer justify-center">
              <Upload className="w-6 h-6 mx-auto mb-2" />

              <Label className="text-sm text-gray-600 justify-center">
                Identification Files
              </Label>
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
                    src={typeof img === "string" ? img : URL.createObjectURL(img)}
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
                  className="border-2 border-dashed border-gray-300 rounded p-4 text-center cursor-pointer justify-center">
                  <Upload className="w-6 h-6 mx-auto mb-2" />
                  <Label className="text-sm text-gray-600 justify-center">
                    Marriage Certificates              </Label>
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
                        src={typeof img === "string" ? img : URL.createObjectURL(img)}
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
          </div>
          <Button
            type="submit"
            className={`w-full ${!isLoading ? "cursor-pointer" : "cursor-not-allowed"
              }`}
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </Button>
        </form>
        <Toaster richColors />{" "}
      </div>
    </>
  );
};

export default Create;
