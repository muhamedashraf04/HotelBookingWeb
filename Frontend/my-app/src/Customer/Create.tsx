import React, { useEffect, useMemo, useRef, useState } from "react";
import Select, { components } from "react-select";
import type { OptionProps, SingleValueProps } from "react-select";
import countryList from "react-select-country-list";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";



/* ---------- helpers ---------- */
const pad = (n: number) => String(n).padStart(2, "0");
const toInputDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const today = new Date();
const eighteenYearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
const todayStr = toInputDate(today);
const eighteenMaxStr = toInputDate(eighteenYearsAgo);

/* ---------- types ---------- */
type CountryOption = { value: string; label: string };
type FormState = {
  Name: string;
  Email: string;
  PhoneNumber: string;
  Address: string;
  Nationality: string;
  NationalityCode: string;
  PassportNumber: string;
  DateOfBirth: string;
  PassportExpiry: string;
  PassportFile: File | null;
};
type Errors = Partial<Record<keyof FormState, string>>;

/* ---------- react-select renderers ---------- */
const Option = (props: OptionProps<CountryOption>) => (
  <components.Option {...props}>
    <div className="flex items-center gap-2">
      
      <span>{props.data.label}</span>
    </div>
  </components.Option>
);

const SingleValue = (props: SingleValueProps<CountryOption>) => (
  <components.SingleValue {...props}>
    <div className="flex items-center gap-2">
      
      <span>{props.data.label}</span>
    </div>
  </components.SingleValue>
);

/* ---------- main component ---------- */
const GuestRegistrationForm = () => {
  const [form, setForm] = useState<FormState>({
    Name: "",
    Email: "",
    PhoneNumber: "",
    Address: "",
    Nationality: "",
    NationalityCode: "",
    PassportNumber: "",
    DateOfBirth: "",
    PassportExpiry: "",
    PassportFile: null,
  });

  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const prevBlobUrl = useRef<string | null>(null);

  const countryOptions = useMemo(() => countryList().getData(), []);

  const setField = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  useEffect(() => {
    return () => {
      if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current);
    };
  }, []);

  /* ---------- File Handling ---------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (prevBlobUrl.current) URL.revokeObjectURL(prevBlobUrl.current);
    prevBlobUrl.current = null;

    if (!file) {
      setField("PassportFile", null);
      setPreviewUrl(null);
      return;
    }

    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setErrors((p) => ({ ...p, PassportFile: "Only JPG, PNG, or PDF allowed." }));
      setField("PassportFile", null);
      setPreviewUrl(null);
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrors((p) => ({ ...p, PassportFile: "File must be <= 8MB." }));
      setField("PassportFile", null);
      setPreviewUrl(null);
      return;
    }

    setField("PassportFile", file);
    const url = URL.createObjectURL(file);
    prevBlobUrl.current = url;
    setPreviewUrl(url);
  };

  /* ---------- Validation ---------- */
  const validate = (): boolean => {
    const e: Errors = {};
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.Email);

    if (!form.Name.trim()) e.Name = "Name is required.";
    if (!emailOk) e.Email = "Enter a valid email (e.g., name@gmail.com).";
    if (!form.PhoneNumber) e.PhoneNumber = "Phone number is required.";
    if (!form.Nationality) e.Nationality = "Select nationality.";
    if (!form.PassportNumber.trim()) e.PassportNumber = "Passport/ID number is required.";
    if (!form.DateOfBirth) e.DateOfBirth = "Date of birth is required.";
    if (!form.PassportExpiry) e.PassportExpiry = "Passport expiry is required.";
    if (!form.PassportFile) e.PassportFile = "Passport scan is required.";

    // Age check
    if (form.DateOfBirth) {
      const dob = new Date(form.DateOfBirth);
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      if (age < 18) e.DateOfBirth = "Guest must be at least 18 years old.";
    }

    // Passport expiry
    if (form.PassportExpiry) {
      const exp = new Date(form.PassportExpiry);
      const t0 = new Date(toInputDate(today));
      if (exp < t0) e.PassportExpiry = "Passport must be valid today or later.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const data = new FormData();
    data.append("Name", form.Name);
    data.append("Email", form.Email);
    data.append("PhoneNumber", form.PhoneNumber);
    data.append("Address", form.Address);
    data.append("Nationality", form.Nationality);
    data.append("PassportNumber", form.PassportNumber);
    data.append("DateOfBirth", new Date(form.DateOfBirth).toISOString());
    data.append("PassportExpiry", new Date(form.PassportExpiry).toISOString());
    if (form.PassportFile) data.append("PassportFile", form.PassportFile);

    try {
      const res = await fetch("/api/guest/register", { method: "POST", body: data });
      if (!res.ok) {
        const txt = await res.text();
        toast.error(txt || `Server error: ${res.status}`);
        setSubmitting(false);
        return;
      }
      toast.success("Guest registered successfully.");
      setForm({
        Name: "",
        Email: "",
        PhoneNumber: "",
        Address: "",
        Nationality: "",
        NationalityCode: "",
        PassportNumber: "",
        DateOfBirth: "",
        PassportExpiry: "",
        PassportFile: null,
      });
      setPreviewUrl(null);
      setShowModal(false);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
    } catch (err) {
      console.error(err);
      toast.error("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const openImageModal = () => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setShowModal(true);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow">
      <Toaster richColors />
      <h2 className="text-2xl font-semibold mb-4">Guest Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <Label>Name *</Label>
          <Input value={form.Name} onChange={e => setField("Name", e.target.value)} />
          {errors.Name && <p className="text-red-600 mt-1 text-sm">{errors.Name}</p>}
        </div>

        {/* Email */}
        <div>
          <Label>Email *</Label>
          <Input type="email" value={form.Email} onChange={e => setField("Email", e.target.value)} />
          {errors.Email && <p className="text-red-600 mt-1 text-sm">{errors.Email}</p>}
        </div>

        {/* Phone */}
        <div>
          <Label>Phone Number *</Label>
          <PhoneInput country={"us"} value={form.PhoneNumber} onChange={val => setField("PhoneNumber", val)} inputStyle={{ width: "100%" }} />
          {errors.PhoneNumber && <p className="text-red-600 mt-1 text-sm">{errors.PhoneNumber}</p>}
        </div>

        {/* Address */}
        <div>
          <Label>Address <span className="text-gray-500">(optional)</span></Label>
          <Input value={form.Address} onChange={e => setField("Address", e.target.value)} />
        </div>

        {/* Nationality */}
        <div>
          <Label>Nationality *</Label>
          <Select<CountryOption, false>
            options={countryOptions} components={{ Option, SingleValue }}
            isSearchable placeholder="Select nationality..."
            value={form.NationalityCode ? { value: form.NationalityCode, label: form.Nationality } : null}
            onChange={opt => {
              if (opt) {
                setField("Nationality", opt.label);
                setField("NationalityCode", opt.value);
              } else {
                setField("Nationality", "");
                setField("NationalityCode", "");
              }
            }}
          />
          {errors.Nationality && <p className="text-red-600 mt-1 text-sm">{errors.Nationality}</p>}
        </div>

        {/* Passport Number */}
        <div>
          <Label>Passport / ID Number *</Label>
          <Input value={form.PassportNumber} onChange={e => setField("PassportNumber", e.target.value)} placeholder="e.g. A12345678" />
          {errors.PassportNumber && <p className="text-red-600 mt-1 text-sm">{errors.PassportNumber}</p>}
        </div>

        {/* Date of Birth */}
        <div>
          <Label>Date of Birth (18+ required) *</Label>
          <Input type="date" value={form.DateOfBirth} onChange={e => setField("DateOfBirth", e.target.value)} max={eighteenMaxStr} />
          {errors.DateOfBirth && <p className="text-red-600 mt-1 text-sm">{errors.DateOfBirth}</p>}
        </div>

        {/* Passport Expiry */}
        <div>
          <Label>Passport Expiry *</Label>
          <Input type="date" value={form.PassportExpiry} onChange={e => setField("PassportExpiry", e.target.value)} min={todayStr} />
          {errors.PassportExpiry && <p className="text-red-600 mt-1 text-sm">{errors.PassportExpiry}</p>}
        </div>

        {/* Passport File */}
        <div>
          <Label>Passport Scan (JPG/PNG/PDF, ≤8MB) *</Label>
          <Input type="file" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" />
          {errors.PassportFile && <p className="text-red-600 mt-1 text-sm">{errors.PassportFile}</p>}
          {previewUrl && (
            <img
              src={previewUrl} onClick={openImageModal}
              className="mt-2 cursor-pointer border rounded max-h-48 object-contain"
            />
          )}
        </div>

        <Button type="submit" disabled={submitting} className="w-full">
          {submitting ? "Submitting..." : "Register Guest"}
        </Button>
      </form>

      {/* Modal */}
      {showModal && previewUrl && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50" onClick={() => setShowModal(false)}>
          <div className="relative max-w-3xl max-h-[80vh] overflow-auto">
            <img
              src={previewUrl}
              className="object-contain cursor-zoom-in"
              style={{ transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)` }}
              onWheel={e => setZoom(prev => Math.min(Math.max(prev + e.deltaY * -0.001, 0.5), 5))}
              onClick={e => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};


export default GuestRegistrationForm;
