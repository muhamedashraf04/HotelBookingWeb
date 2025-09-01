"use client";

import Header from "@/components/Header/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import DeletePopup from "@/DeletePopup";
import ErrorToast from "@/Toasts/ErrorToast";
import LoadingToast from "@/Toasts/LoadingToast";
import SuccessToast from "@/Toasts/SuccessToast";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useMemo, useState } from "react";
import { Url } from "../../GlobalVariables.tsx";

// shadcn popover + react-colorful
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Droplet } from "lucide-react";
import { HexColorInput, HexColorPicker } from "react-colorful";

// Types
export type Rate = {
  id: number;
  type: string;
  price: number;
  badgeBg?: string; // hex color like "#111827"
  badgeText?: string; // hex color like "#ffffff"
};

const ITEMS_PER_PAGE = 20;

const DEFAULT_BG = "#111827"; // gray-900
const DEFAULT_TEXT = "#ffffff"; // white

// ---------- Reusable color popover with eyedropper ----------
function ColorPopover({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (hex: string) => void;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  const handleEyedropper = async () => {
    if ("EyeDropper" in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) onChange(result.sRGBHex);
      } catch (e) {
        console.error("Eyedropper cancelled or failed:", e);
      }
    } else {
      alert("Your browser does not support the EyeDropper API.");
    }
  };

  return (
    <div>
      <div className="text-sm mb-1">{label}</div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="h-10 w-16 rounded border shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            style={{ backgroundColor: value }}
            aria-label={`${label} color swatch`}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3 space-y-2" align="start">
          {/* Color Picker */}
          <HexColorPicker color={value} onChange={onChange} />

          {/* Input + Eyedropper */}
          <div className="flex items-center gap-2">
            <HexColorInput
              color={value}
              onChange={onChange}
              prefixed
              className="border rounded px-2 py-1 w-24"
            />
            <button
              type="button"
              onClick={handleEyedropper}
              className="p-2 border rounded shadow-sm hover:bg-accent"
              title="Pick from screen"
            >
              <Droplet className="w-4 h-4" />
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

const EditRates = () => {
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Rate | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // set axios auth header from cookie once on mount
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
    fetchRates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load rates
  const fetchRates = async () => {
    setLoading(true);
    LoadingToast("Loading rates...");
    try {
      const res = await axios.get(`${Url}/Admin/Rate/GetAll`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      });
      if (res.status !== 200) throw new Error("Failed to fetch rates");
      const normalized: Rate[] = (res.data as Rate[]).map((r) => ({
        ...r,
        badgeBg: r.badgeBg || DEFAULT_BG,
        badgeText: r.badgeText || DEFAULT_TEXT,
      }));
      setRates(normalized);
      SuccessToast("Loaded");
    } catch (err: any) {
      ErrorToast(err?.message || "Could not load rates");
    } finally {
      setLoading(false);
    }
  };

  // pagination derived
  const totalPages = Math.max(1, Math.ceil(rates.length / ITEMS_PER_PAGE));
  const paginated = useMemo(
    () =>
      rates.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [rates, currentPage]
  );

  // editing helpers
  const startEdit = (r: Rate) => {
    setEditingId(r.id);
    setDraft({ ...r });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  const saveEdit = async () => {
    if (!draft) return;
    if (!draft.type || draft.type.trim().length === 0) {
      ErrorToast("Type is required");
      return;
    }
    if (!isFinite(draft.price) || draft.price < 0) {
      ErrorToast("Price must be >= 0");
      return;
    }

    setIsSaving(true);
    LoadingToast("Saving rate...");
    try {
      const payload = {
        id: draft.id > 0 ? draft.id : undefined,
        type: draft.type,
        price: draft.price,
        badgeBg: draft.badgeBg || DEFAULT_BG,
        badgeText: draft.badgeText || DEFAULT_TEXT,
      };
      const res = await axios.post(`${Url}/Admin/Rate/Upsert`, payload);
      if (res?.data && res.data.id) {
        const returned = res.data as Rate;
        setRates((prev) => prev.map((x) => (x.id === draft.id ? returned : x)));
      } else {
        await fetchRates();
      }
      SuccessToast("Rate saved");
      cancelEdit();
    } catch (e: any) {
      ErrorToast(e?.response?.data ?? "Failed to save rate");
    } finally {
      setIsSaving(false);
    }
  };

  const addNew = async () => {
    const tempId = -Date.now();
    const newRate: Rate = {
      id: tempId,
      type: "",
      price: 0,
      badgeBg: DEFAULT_BG,
      badgeText: DEFAULT_TEXT,
    };
    setRates((p) => [newRate, ...p]);
    setCurrentPage(1);
    startEdit(newRate);
  };

  const handlePersistNew = async () => {
    if (!draft) return;
    if (!draft.type || draft.type.trim() === "") {
      ErrorToast("Type is required");
      return;
    }
    if (!isFinite(draft.price) || draft.price < 0) {
      ErrorToast("Price must be >= 0");
      return;
    }

    setIsSaving(true);
    LoadingToast("Creating rate...");
    try {
      const res = await axios.post(`${Url}/Admin/Rate/Upsert`, {
        type: draft.type,
        price: draft.price,
        badgeBg: draft.badgeBg || DEFAULT_BG,
        badgeText: draft.badgeText || DEFAULT_TEXT,
      });

      if (res?.data && res.data.id) {
        const created = res.data as Rate;
        setRates((prev) => [
          created,
          ...prev.filter((r) => !(r.id < 0) && r.id !== created.id),
        ]);
      } else {
        await fetchRates();
      }

      SuccessToast("Rate created");
      cancelEdit();
    } catch (e: any) {
      ErrorToast(e?.response?.data ?? "Failed to create rate");
    } finally {
      setIsSaving(false);
    }
  };

  const refreshPrices = async () => {
    setIsSaving(true);
    LoadingToast("Refreshing prices...");
    try {
      await axios.patch(`${Url}/Admin/Rate/Refresh`);
      SuccessToast("Room prices refreshed according to rates.");
      await fetchRates();
    } catch (e: any) {
      ErrorToast(e?.response?.data ?? "Failed to refresh prices");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Header />
      <div className="p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Rates</h1>
          <div className="flex gap-3">
            <Button
              onClick={addNew}
              className="cursor-pointer"
              disabled={isSaving}
            >
              Add Rate
            </Button>
            <Button
              variant="secondary"
              onClick={refreshPrices}
              className="cursor-pointer"
              disabled={isSaving}
            >
              Refresh Prices (Apply to Rooms)
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border rounded p-4 shadow space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        ) : rates.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No rates found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paginated.map((r) => {
              const isEditing = editingId === r.id;
              const bg = isEditing
                ? draft?.badgeBg || DEFAULT_BG
                : r.badgeBg || DEFAULT_BG;
              const fg = isEditing
                ? draft?.badgeText || DEFAULT_TEXT
                : r.badgeText || DEFAULT_TEXT;

              return (
                <div
                  key={r.id + "-" + r.type}
                  className="border rounded-xl p-4 shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      {isEditing ? (
                        <>
                          <input
                            className="w-full text-2xl font-bold bg-transparent outline-none"
                            placeholder="Type (e.g. Double)"
                            value={draft?.type ?? ""}
                            onChange={(e) =>
                              setDraft((d) =>
                                d ? { ...d, type: e.target.value } : d
                              )
                            }
                          />
                          <div className="mt-2 flex gap-2 items-center">
                            <Input
                              type="number"
                              step="0.01"
                              value={draft?.price ?? 0}
                              onChange={(e) =>
                                setDraft((d) =>
                                  d
                                    ? {
                                        ...d,
                                        price: parseFloat(
                                          e.target.value || "0"
                                        ),
                                      }
                                    : d
                                )
                              }
                            />
                            <span className="text-sm">EGP</span>
                          </div>

                          {/* Two popover color pickers; close by clicking outside */}
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ColorPopover
                              label="Badge background"
                              value={bg}
                              onChange={(hex) =>
                                setDraft((d) =>
                                  d ? { ...d, badgeBg: hex } : d
                                )
                              }
                            />
                            <ColorPopover
                              label="Badge text"
                              value={fg}
                              onChange={(hex) =>
                                setDraft((d) =>
                                  d ? { ...d, badgeText: hex } : d
                                )
                              }
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <h2 className="text-2xl font-bold">{r.type}</h2>
                          <p className="text-lg mt-1">
                            {r.price?.toFixed(2)} EGP
                          </p>
                        </>
                      )}
                    </div>

                    <div className="text-right">
                      <Badge
                        className="text-lg"
                        style={{ backgroundColor: bg, color: fg }}
                        title={`${r.type} (${bg} / ${fg})`}
                      >
                        {isEditing ? draft?.type || "Type" : r.type}
                      </Badge>

                      <div className="mt-3 flex flex-col items-end gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                r.id < 0 ? handlePersistNew() : saveEdit()
                              }
                              className="cursor-pointer"
                              disabled={isSaving}
                            >
                              Save
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={cancelEdit}
                              className="cursor-pointer"
                              disabled={isSaving}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              onClick={() => startEdit(r)}
                              className="cursor-pointer"
                              disabled={isSaving}
                            >
                              Edit
                            </Button>
                            <DeletePopup
                              id={`${r.id}`}
                              message={`Delete rate "${r.type}"? This cannot be undone.`}
                              Area="Admin"
                              Controller="Rate"
                              Action="Remove"
                              onDeleted={() => {
                                setRates((prev) =>
                                  prev.filter((x) => x.id !== r.id)
                                );
                              }}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* simple pagination controls */}
        {!loading && rates.length > ITEMS_PER_PAGE && (
          <div className="mt-6 flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1 || isSaving}
              className="cursor-pointer"
            >
              Prev
            </Button>
            <div className="px-4 py-2 border rounded">
              {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || isSaving}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

export default EditRates;
