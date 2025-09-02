"use client";

import Header from "@/components/Header/Header";
import { Button } from "@/components/ui/button";
import axios from "axios";
import Cookies from "js-cookie";
import React, { useEffect, useState, type DragEvent, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { Url } from "../../GlobalVariables";

type User = {
  id: number;
  userName: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  password: string;
  discountLimit: number;
};

export default function ConfigurationPage(): JSX.Element {
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // hotel logo
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // drag state
  const [isDragging, setIsDragging] = useState(false);

  // modal form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [formState, setFormState] = useState({
    userName: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "User",
    discountLimit: 0,
  });

  // axios instance
  const api = axios.create({
    baseURL: `${Url}/api/auth`,
    headers: {
      Authorization: `Bearer ${Cookies.get("token") ?? ""}`,
    },
  });

  // fetch users & admins
  async function fetchAll() {
    setLoading(true);
    try {
      const [uRes, aRes] = await Promise.all([
        api.get("getallusers").catch(() => ({ data: [] })),
        api.get("getalladmins").catch(() => ({ data: [] })),
      ]);
      setUsers(uRes.data);
      setAdmins(aRes.data);
    } catch (err: any) {
      toast.error(err?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }

  // sync logo (backend vs localStorage)
  async function syncLogo() {
    try {
      const res = await axios.get(`${Url}/admin/configuration/getimageurl`);
      const latestUrl = res.data;
      const storedUrl = localStorage.getItem("hotelLogo");
      if (latestUrl !== storedUrl) {
        localStorage.setItem("hotelLogo", latestUrl);
      }
      setLogoPreview(latestUrl);
    } catch (err) {
      console.error("syncLogo error:", err);
      setLogoPreview(localStorage.getItem("hotelLogo"));
    }
  }

  useEffect(() => {
    void fetchAll();
    void syncLogo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // delete user/admin
  async function handleDelete(type: "user" | "admin", id: number) {
    if (!confirm("Are you sure?")) return;
    try {
      const endpoint =
        type === "user" ? `delete-user/${id}` : `delete-admin/${id}`;
      await api.delete(endpoint);
      toast.success("Deleted successfully");
      await fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data || err?.message || "Delete failed");
    }
  }

  // open create form
  function openCreate(role: "User" | "Admin") {
    setEditing(null);
    setFormState({
      userName: "",
      email: "",
      phoneNumber: "",
      password: "",
      discountLimit: 0,
      role,
    });
    setIsFormOpen(true);
  }

  // open edit form
  function openEdit(item: User) {
    setEditing(item);
    setFormState({
      userName: item.userName ?? "",
      email: item.email ?? "",
      phoneNumber: item.phoneNumber ?? "",
      password: "",
      role: (item.role as "User" | "Admin") ?? "User",
      discountLimit: item.discountLimit ?? 0,
    });
    setIsFormOpen(true);
  }

  // simple validation
  function validateForm() {
    if (!formState.userName || formState.userName.trim().length < 3) {
      toast.error("Username must be at least 3 characters");
      return false;
    }
    if (!formState.email || !/\S+@\S+\.\S+/.test(formState.email)) {
      toast.error("Please provide a valid email");
      return false;
    }
    if (!editing && (!formState.password || formState.password.length < 6)) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    return true;
  }

  // create/update user
  async function handleFormSubmit(e?: React.FormEvent) {
    e?.preventDefault?.();
    if (!validateForm()) return;
    try {
      if (editing) {
        const id = editing.id;
        const dto = {
          UserName: formState.userName,
          Email: formState.email,
          PhoneNumber: formState.phoneNumber,
          Password: formState.password || null,
          discountLimit: formState.discountLimit,
        };
        const endpoint =
          formState.role === "Admin"
            ? `update-admin/${id}`
            : `update-user/${id}`;
        await api.put(endpoint, dto);
        toast.success("Updated successfully");
      } else {
        const dto = {
          UserName: formState.userName,
          Email: formState.email,
          PhoneNumber: formState.phoneNumber,
          Password: formState.password,
          discountLimit: formState.discountLimit,
        };
        const endpoint =
          formState.role === "Admin" ? `register-admin` : `register-user`;
        await api.post(endpoint, dto);
        toast.success("Created successfully");
      }
      setIsFormOpen(false);
      setEditing(null);
      await fetchAll();
    } catch (err: any) {
      toast.error(err?.response?.data || err?.message || "Operation failed");
    }
  }

  // handle logo file selection
  function handleFile(file: File) {
    setSelectedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  // upload logo -> backend -> backend uploads to Cloudinary
  async function uploadLogoToBackend() {
    if (!selectedFile) {
      toast.error("No file selected");
      return;
    }
    const fd = new FormData();
    fd.append("uploadedFile", selectedFile);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const res = await axios.post(`${Url}/admin/configuration/upsert`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percent);
          }
        },
      });
      const newUrl = res.data;
      localStorage.setItem("hotelLogo", newUrl);
      toast.success("Logo uploaded");
      await syncLogo(); // refresh after upload
    } catch (err: any) {
      toast.error(err?.response?.data || err?.message || "Upload failed");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000); // reset after a second
    }
  }

  return (
    <>
      {isUploading ? "" : <Header />}
      <div className="p-6 max-w-6xl mx-auto">
        <Toaster richColors />
        <h1 className="text-3xl font-bold mb-6 text-center">Configuration</h1>

        {/* Hotel Logo */}
        <section className="mb-6 border rounded p-4">
          <h2 className="text-xl font-semibold mb-2">Hotel Logo</h2>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="logo"
                className="h-24 w-24 object-contain border"
              />
            ) : (
              <div className="h-24 w-24 flex items-center justify-center border text-sm text-gray-500">
                No logo
              </div>
            )}
            <div className="flex-1">
              {/* Drop Area */}
              <div
                className={`border-2 border-dashed rounded p-6 text-center cursor-pointer ${
                  isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() =>
                  document.getElementById("hiddenFileInput")?.click()
                }
              >
                {selectedFile ? (
                  <p>{selectedFile.name}</p>
                ) : (
                  <p>Drag & drop or click to select an image</p>
                )}
                <input
                  id="hiddenFileInput"
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </div>

              <div className="mt-3 flex flex-col gap-2 ">
                <Button
                  className="max-w-fit cursor-pointer"
                  onClick={uploadLogoToBackend}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? "Uploading..." : "Upload"}
                </Button>

                {/* Progress bar */}
                {isUploading || uploadProgress > 0 ? (
                  <div className="w-full bg-gray-200 rounded h-2">
                    <div
                      className="bg-blue-500 h-2 rounded"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* Admins */}
        <section className="mb-6 border rounded p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Admins</h2>
            <Button onClick={() => openCreate("Admin")}>Add Admin</Button>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Username</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Discount Limit</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-500">
                      No admins
                    </td>
                  </tr>
                ) : (
                  admins.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="p-2 border">{a.id}</td>
                      <td className="p-2 border">{a.userName}</td>
                      <td className="p-2 border">{a.email}</td>
                      <td className="p-2 border">{a.discountLimit}%</td>
                      <td className="p-2 border">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => openEdit(a)}>
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete("admin", a.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </section>

        {/* Users */}
        <section className="mb-6 border rounded p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Users</h2>
            <Button onClick={() => openCreate("User")}>Add User</Button>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Username</th>
                  <th className="p-2 border">Email</th>
                  <th className="p-2 border">Phone</th>
                  <th className="p-2 border">Discount Limit</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      No users
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="border-t">
                      <td className="p-2 border">{u.id}</td>
                      <td className="p-2 border">{u.userName}</td>
                      <td className="p-2 border">{u.email}</td>
                      <td className="p-2 border">{u.phoneNumber ?? "-"}</td>
                      <td className="p-2 border">{u.discountLimit}%</td>
                      <td className="p-2 border">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => openEdit(u)}>
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete("user", u.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </section>

        {/* Create/Edit Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {editing ? "Edit" : "Add"} {formState.role}
              </h3>
              <form onSubmit={(e) => void handleFormSubmit(e)}>
                <input
                  className="w-full border p-2 mb-3"
                  placeholder="Username"
                  value={formState.userName}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, userName: e.target.value }))
                  }
                />
                <input
                  className="w-full border p-2 mb-3"
                  placeholder="Email"
                  value={formState.email}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, email: e.target.value }))
                  }
                />
                <input
                  className="w-full border p-2 mb-3"
                  placeholder="Phone"
                  value={formState.phoneNumber}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, phoneNumber: e.target.value }))
                  }
                />
                <input
                  type="password"
                  className="w-full border p-2 mb-3"
                  placeholder="Password"
                  value={formState.password}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, password: e.target.value }))
                  }
                />
                <input
                  type="number"
                  className="w-full border p-2 mb-3"
                  placeholder="Discount Limit"
                  value={formState.discountLimit}
                  onChange={(e) =>
                    setFormState((s) => ({
                      ...s,
                      discountLimit: Number(e.target.value),
                    }))
                  }
                />
                <select
                  className="w-full border p-2 mb-4"
                  value={formState.role}
                  onChange={(e) =>
                    setFormState((s) => ({ ...s, role: e.target.value }))
                  }
                >
                  <option>User</option>
                  <option>Admin</option>
                </select>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditing(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">{editing ? "Update" : "Create"}</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
