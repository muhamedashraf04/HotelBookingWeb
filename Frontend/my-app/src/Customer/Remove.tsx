"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Url } from "../../GlobalVariables";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SuccessToast from "../Toasts/SuccessToast";
import ErrorToast from "../Toasts/ErrorToast";
import LoadingToast from "../Toasts/LoadingToast";
import Header from "@/components/Header/Header";
import countries from "world-countries";



type Customer = {
  id: string;
  name: string;
  phoneNumber: string;
  address: string;
  nationality: string;
  identificationType: string;
  identificationNumber: string;
  identificationAttachment?: string | string[]; // backend may return single string or array
  birthDate?: string; // yyyy-MM-dd
  age?: number;
  email?: string;
  isMarried?: boolean;
  marriageCertificateNumber?: string;
  marriageCertificateAttachment?: string;
  marriedToCustomerId?: string;
  status?: string;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  // --- For editing ---
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  // --- For deleting ---
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

  // Fetch all customers from backend
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${Url}/Admin/Customer/GetCustomers`);
      setCustomers(res.data || []);
    } catch (err: any) {
      ErrorToast(err?.message || "Failed to load customers");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const nationalities = countries.map((c) => ({
    country: c.name.common,
    nationality: c.demonyms?.eng?.m || c.name.common,
  }));
  const sortedNationalities = [...nationalities]
    .map((n) => n.nationality)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort((a, b) => a.localeCompare(b));


  useEffect(() => {
    void fetchCustomers();
  }, []);

  // --- Helpers for images ---
  const getImageList = (c: Customer): string[] => {
    const att = (c as any).identificationAttachment ?? (c as any).identificationAttachments ?? c.identificationAttachment;
    if (!att) return [];
    if (Array.isArray(att)) return att;
    if (typeof att === "string") {
      try {
        const parsed = JSON.parse(att);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // not JSON
      }
      return [att];
    }
    return [];
  };

  // --- Handle file changes for edit ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const handleRemoveExistingImage = (url: string) => {
    setDeletedImages((prev) => [...prev, url]);
    if (editingCustomer) {
      const currentImgs = getImageList(editingCustomer).filter((i) => i !== url);
      setEditingCustomer({ ...editingCustomer, identificationAttachment: currentImgs } as Customer);
    }
  };

  const handleRemoveNewFile = (file: File) => {
    setNewFiles((prev) => prev.filter((f) => f !== file));
  };

  // --- Submit edit ---
  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingCustomer) return;

    setLoading(true);
    LoadingToast("Updating customer...");

    try {
      const formData = new FormData();

      // required + model-matching fields
      formData.append("Id", String(editingCustomer.id));
      formData.append("Name", editingCustomer.name ?? "");
      formData.append("Email", editingCustomer.email ?? "");
      formData.append("PhoneNumber", editingCustomer.phoneNumber ?? "");
      formData.append("Address", editingCustomer.address ?? "");
      formData.append("Nationality", editingCustomer.nationality ?? "");
      formData.append("IdentificationType", editingCustomer.identificationType ?? "");
      formData.append("IdentificationNumber", editingCustomer.identificationNumber ?? "");

      // BirthDate must be yyyy-MM-dd (ASP.NET Core DateOnly)
      if (editingCustomer.birthDate) {
        const date = new Date(editingCustomer.birthDate);
        formData.append("BirthDate", date.toISOString().split("T")[0]);
      }

      // Age (if you calculate client-side, otherwise server does it)
      if (editingCustomer.age !== undefined) {
        formData.append("Age", String(editingCustomer.age));
      }

      // Required boolean
      formData.append("IsMarried", editingCustomer.isMarried ? "true" : "false");

      // Optional marriage fields
      formData.append("MarriageCertificateNumber", editingCustomer.marriageCertificateNumber ?? "");
      formData.append("MarriageCertificateAttachment", editingCustomer.marriageCertificateAttachment ?? "");
      formData.append("MarriedToCustomerId", editingCustomer.marriedToCustomerId ?? "");

      // Status (default Registered if not set)
      formData.append("status", editingCustomer.status ?? "Registered");

      // handle file uploads
      newFiles.forEach((file) => {
        formData.append("uploadedFiles", file);
      });

      // deleted images (send JSON string)
      if (deletedImages.length > 0) {
        formData.append("deletedImages", JSON.stringify(deletedImages));
      }

      const res = await axios.put(`${Url}/Admin/Customer/Edit`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 200) {
        SuccessToast("Customer updated successfully");
        setEditingCustomer(null);
        setNewFiles([]);
        setDeletedImages([]);
        void fetchCustomers();
      } else {
        ErrorToast("Update failed");
      }
    } catch (err: any) {
      console.error(err);
      ErrorToast(err.message || "Error updating customer");
    } finally {
      setLoading(false);
    }
  };

  // --- Delete customer ---
  const handleDelete = async () => {
    if (!deletingCustomer) return;
    setLoading(true);
    LoadingToast("Deleting customer...");

    try {
      // Backend route: [HttpDelete("{id}")] under Admin/Customer/Remove
      await axios.delete(`${Url}/Admin/Customer/Remove/?id=${deletingCustomer.id}`);
      SuccessToast("Customer removed successfully");
      setDeletingCustomer(null);
      void fetchCustomers();
    } catch (err: any) {
      console.error(err);
      ErrorToast(err.message || "Error deleting customer");
    } finally {
      setLoading(false);
    }
  };

  // --- small helper to open edit and reset file states ---
  const openEdit = (c: Customer) => {
    setEditingCustomer({ ...c });
    setNewFiles([]);
    setDeletedImages([]);
  };

  return (
    <>
      <Header />
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
                      <Button size="sm" variant="destructive" onClick={() => setDeletingCustomer(c)}>
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
        <Dialog open={!!editingCustomer} onOpenChange={() => setEditingCustomer(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
            </DialogHeader>

            {editingCustomer && (
              <form className="space-y-4" onSubmit={handleUpdate}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={editingCustomer.name}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editingCustomer.email ?? ""}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Phone Number</Label>
                    <Input
                      value={editingCustomer.phoneNumber ?? ""}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Nationality</Label>
                    <Select
                      value={editingCustomer.nationality}
                      onValueChange={(value) =>
                        setEditingCustomer((prev) => ({ ...prev!, nationality: value }))
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select nationality" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 overflow-y-auto" position="popper">
                        {sortedNationalities.map((nat, idx) => (
                          <SelectItem
                            key={idx}
                            value={nat}
                            // prevent scroll jumping but still allow hover shading
                            onMouseMove={(e) => {
                              e.preventDefault(); // stops jump
                            }}
                          >
                            {nat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Identification Type</Label>
                    <Input
                      value={editingCustomer.identificationType ?? ""}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, identificationType: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Identification Number</Label>
                    <Input
                      value={editingCustomer.identificationNumber ?? ""}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, identificationNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Address</Label>
                    <Input
                      value={editingCustomer.address ?? ""}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Birth Date</Label>
                    <Input
                      type="date"
                      value={editingCustomer.birthDate ?? ""}
                      onChange={(e) => setEditingCustomer({ ...editingCustomer, birthDate: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Is Married</Label>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="isMarried"
                          checked={!!editingCustomer.isMarried}
                          onChange={() => setEditingCustomer({ ...editingCustomer, isMarried: true })}
                        />
                        Yes
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="isMarried"
                          checked={!editingCustomer.isMarried}
                          onChange={() => setEditingCustomer({ ...editingCustomer, isMarried: false })}
                        />
                        No
                      </label>
                    </div>
                  </div>

                  {/* Existing images */}
                  <div className="md:col-span-2">
                    <Label>Existing Identification Images</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {getImageList(editingCustomer).map((img) => (
                        <div key={img} className="relative">
                          <img src={img} alt="id" className="w-24 h-24 object-cover rounded" />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute top-0 right-0"
                            onClick={() => handleRemoveExistingImage(img)}
                          >
                            X
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Upload New Images */}
                  <div className="md:col-span-2">
                    <Label>Upload New Identification Images</Label>
                    <Input type="file" multiple onChange={handleFileChange} />
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newFiles.map((file, idx) => (
                        <div key={idx} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="preview"
                            className="w-24 h-24 object-cover rounded"
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute top-0 right-0"
                            onClick={() => handleRemoveNewFile(file)}
                          >
                            X
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" onClick={() => { setEditingCustomer(null); setNewFiles([]); setDeletedImages([]); }} variant="outline">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete confirmation dialog */}
        <Dialog open={!!deletingCustomer} onOpenChange={() => setDeletingCustomer(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to remove <strong>{deletingCustomer?.name}</strong>?</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeletingCustomer(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>{loading ? "Deleting..." : "Delete"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
