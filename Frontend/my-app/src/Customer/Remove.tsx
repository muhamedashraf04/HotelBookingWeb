"use client";

import axiosInstance from "@/AxiosInstance.tsx";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import { Url } from "../../GlobalVariables";

import Header from "@/components/Header/Header";
import { parseTokenRoleAndUser } from "@/components/Header/Nav";
import Cookies from "js-cookie";
import { Upload } from "lucide-react";

import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import countries from "world-countries";
import ErrorToast from "../Toasts/ErrorToast";
import SuccessToast from "../Toasts/SuccessToast";

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

export default function CustomersPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = Cookies.get("token");
    const { role } = parseTokenRoleAndUser(token);

    if (!(role === "Admin" || role === "Receptionist")) {
      navigate("/login");
    }
  }, []);
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(
    null
  );

  const idFileInputRef = useRef<HTMLInputElement>(null);
  const marFileInputRef = useRef<HTMLInputElement>(null);

  const [IDexistingImages, setIDExistingImages] = useState<string[]>([]);
  const [IDnewImages, setIDNewImages] = useState<File[]>([]);
  const [IDdeletedImages, setIDDeletedImages] = useState<string[]>([]);

  const [MARexistingImages, setMARExistingImages] = useState<string[]>([]);
  const [MARnewImages, setMARNewImages] = useState<File[]>([]);
  const [MARdeletedImages, setMARDeletedImages] = useState<string[]>([]);

  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);

  const [editOpen, setEditOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const nationalities = countries.map((c) => ({
    country: c.name.common,
    nationality: c.demonyms?.eng?.m || c.name.common,
  }));
  const sortedNationalities = [...nationalities]
    .map((n) => n.nationality)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort((a, b) => a.localeCompare(b));

  // Fetch all customers from backend
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`${Url}/Admin/Customer/GetCustomers`);
      setCustomers(res.data || []);
    } catch (err: any) {
      ErrorToast(err?.message || "Failed to load customers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCustomers();
    setIDExistingImages(
      typeof editingCustomer?.identificationAttachment === "string" &&
        editingCustomer?.identificationAttachment.trim().length > 0
        ? editingCustomer?.identificationAttachment
            .split(",")
            .map((img: string) => img.trim())
            .filter((img: string) => img.length > 0)
        : []
    );
    setMARExistingImages(
      typeof editingCustomer?.marriageCertificateAttachment === "string" &&
        editingCustomer?.marriageCertificateAttachment.trim().length > 0
        ? editingCustomer?.marriageCertificateAttachment
            .split(",")
            .map((img: string) => img.trim())
            .filter((img: string) => img.length > 0)
        : []
    );
  }, []);

  const handleDeleteCustomer = async () => {
    if (!deletingCustomer) return;

    try {
      await axiosInstance.delete(
        `${Url}/Admin/Customer/Remove/${deletingCustomer.id}`
      );
      SuccessToast("Customer deleted successfully!");
      setDeletingCustomer(null);
      await fetchCustomers(); // refresh table
    } catch (err: any) {
      toast.error(err?.response?.data || "Error deleting customer");
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
  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || isEditing) return;
    setIsEditing(true);
    const newErrors: { [key: string]: string } = {};

    if (editingCustomer.email?.trim() === "")
      newErrors.email = "Email is required";
    if (!editingCustomer.identificationType)
      newErrors.identificationType = "ID type is required";
    if (editingCustomer.phoneNumber?.trim() === "")
      newErrors.phoneNumber = "Phone number is required";
    if (!editingCustomer.nationality)
      newErrors.nationality = "Nationality is required";

    if (IDexistingImages.length + IDnewImages.length === 0)
      newErrors.identificationFiles = "At least one ID file is required";
    if (
      editingCustomer.isMarried &&
      MARexistingImages.length + MARnewImages.length === 0
    )
      newErrors.marriageFiles = "Marriage certificate is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill all required fields");
      return;
    }
    if (IDexistingImages.length === 0) {
      toast.error("At least one Identification file is required");
      return;
    }
    if (editingCustomer.isMarried && MARexistingImages.length === 0) {
      toast.error("Marriage certificate is required for married customers");
      return;
    }

    setErrors({});
    setEditOpen(true);

    try {
      const formData = new FormData();
      formData.append("customer.Id", String(editingCustomer.id));
      formData.append("customer.Name", editingCustomer.name || "");
      formData.append("customer.BirthDate", editingCustomer.birthDate || "");
      formData.append("customer.Email", editingCustomer.email || "");
      formData.append(
        "customer.Nationality",
        editingCustomer.nationality || ""
      );
      formData.append("customer.Address", editingCustomer.address || "");
      formData.append(
        "customer.PhoneNumber",
        editingCustomer.phoneNumber || ""
      );
      formData.append(
        "customer.IdentificationType",
        editingCustomer.identificationType || ""
      );
      formData.append(
        "customer.IdentificationNumber",
        editingCustomer.identificationNumber || ""
      );
      formData.append(
        "customer.IsMarried",
        editingCustomer.isMarried ? "true" : "false"
      );

      IDnewImages.forEach((file) =>
        formData.append("IdentificationFiles", file)
      );
      MARnewImages.forEach((file) =>
        formData.append("MarriageCertificates", file)
      );

      const allDeletedImages = [...IDdeletedImages, ...MARdeletedImages];
      if (allDeletedImages.length > 0) {
        formData.append("DeletedImages", JSON.stringify(allDeletedImages));
      }
      await axiosInstance.post(`${Url}/Admin/Customer/Edit`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      SuccessToast("Customer updated successfully!");
      setEditOpen(false);

      setIDNewImages([]);
      setMARNewImages([]);
      setIDDeletedImages([]);
      setMARDeletedImages([]);
      setEditingCustomer(null);

      await fetchCustomers();
    } catch (err: any) {
      console.error(err);
      toast.error(err.res?.data || err.message || "Error updating customer");
    } finally {
      setIsEditing(false);
    }
  };

  const openEdit = (c: Customer) => {
    setEditingCustomer({ ...c });
    setBirthDate(c.birthDate ? new Date(c.birthDate) : undefined);
    setMARDeletedImages([]);
    setIDExistingImages(
      c.identificationAttachment?.split(",").map((s) => s.trim()) || []
    );
    setMARExistingImages(
      c.marriageCertificateAttachment?.split(",").map((s) => s.trim()) || []
    );
    setIDNewImages([]);
    setMARNewImages([]);
    setIDDeletedImages([]);
    setEditOpen(true);
  };

  return (
    <>
      <Header />
      <Toaster richColors />

      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Manage Customers</h1>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Nationality</th>
                <th className="p-3 text-left">ID Number</th>
                <th className="p-3 text-left">Birth Date</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.phoneNumber}</td>
                  <td className="p-3">{c.nationality}</td>
                  <td className="p-3">{c.identificationNumber}</td>
                  <td className="p-3">{c.birthDate}</td>
                  <td className="p-3 text-center">
                    <div className="inline-flex gap-2">
                      <Button size="sm" onClick={() => openEdit(c)}>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeletingCustomer(c)}
                      >
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>

            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              onSubmit={handleEditCustomer}
            >
              <div>
                <Label>Name *</Label>
                <Input
                  disabled
                  value={editingCustomer?.name}
                  onChange={(e) => {
                    if (!editingCustomer) {
                      return;
                    }
                    setEditingCustomer({
                      ...editingCustomer,
                      name: e.target.value,
                    });
                  }}
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={editingCustomer?.email ?? ""}
                  onChange={(e) => {
                    if (!editingCustomer) {
                      return;
                    }
                    setEditingCustomer({
                      ...editingCustomer,
                      email: e.target.value,
                    });
                  }}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>
              <div>
                <Label>Phone Number *</Label>
                <Input
                  value={editingCustomer?.phoneNumber ?? ""}
                  onChange={(e) => {
                    if (!editingCustomer) {
                      return;
                    }
                    setEditingCustomer({
                      ...editingCustomer,
                      phoneNumber: e.target.value,
                    });
                  }}
                  className={errors.phoneNumber ? "border-red-500" : ""}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
                )}
              </div>
              <div>
                <Label>Nationality *</Label>
                <Select
                  onValueChange={(value) => {
                    if (!editingCustomer) return;
                    setEditingCustomer({
                      ...editingCustomer,
                      nationality: value,
                    });
                  }}
                  value={editingCustomer?.nationality}
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
                  value={editingCustomer?.identificationType}
                  onValueChange={(value) => {
                    if (!editingCustomer) {
                      return;
                    }
                    setEditingCustomer({
                      ...editingCustomer,
                      identificationType: value,
                    });
                  }}
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
                <Label className="">Identification Number *</Label>
                <Input
                  disabled
                  value={editingCustomer?.identificationNumber ?? ""}
                  onChange={(e) => {
                    if (!editingCustomer) {
                      return;
                    }
                    setEditingCustomer({
                      ...editingCustomer,
                      identificationNumber: e.target.value,
                    });
                  }}
                />
              </div>
              <div>
                <Label>Address (Optional)</Label>
                <Input
                  value={editingCustomer?.address ?? ""}
                  onChange={(e) => {
                    if (!editingCustomer) {
                      return;
                    }
                    setEditingCustomer({
                      ...editingCustomer,
                      address: e.target.value,
                    });
                  }}
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
                          {
                            if (!editingCustomer) {
                              return;
                            }
                            setEditingCustomer({
                              ...editingCustomer,
                              birthDate: formatted,
                            });
                            setIsCalendarOpen(false);
                          }
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
                      checked={editingCustomer?.isMarried === true}
                      onChange={() => {
                        if (!editingCustomer) {
                          return;
                        }
                        setEditingCustomer({
                          ...editingCustomer,
                          isMarried: true,
                        });
                      }}
                    />
                    Married
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="IsMarried"
                      checked={editingCustomer?.isMarried === false}
                      onChange={() => {
                        if (!editingCustomer) {
                          return;
                        }
                        setEditingCustomer({
                          ...editingCustomer,
                          isMarried: false,
                        });
                      }}
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
                    className="relative w-20 h-20 border rounded overflow-hidden flex items-center justify-center bg-gray-100"
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

              {editingCustomer?.isMarried && (
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
                    {[...MARexistingImages, ...MARnewImages].map(
                      (img, index) => (
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
                      )
                    )}
                  </div>
                </>
              )}

              <DialogFooter className="block">
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Button
                    type="button"
                    onClick={() => setEditOpen(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isEditing} className="w-full">
                    {isEditing ? "Editing..." : "Edit"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog
          open={!!deletingCustomer}
          onOpenChange={() => setDeletingCustomer(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to delete {deletingCustomer?.name}?</p>
            <DialogFooter>
              <Button onClick={() => setDeletingCustomer(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteCustomer}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
