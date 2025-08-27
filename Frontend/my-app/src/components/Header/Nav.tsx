import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import { Url } from "../../../GlobalVariables";
import NavbarAuthButtons from "./AuthButtons";
import Logo from "./Logo";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

import ErrorToast from "@/Toasts/ErrorToast";
import LoadingToast from "@/Toasts/LoadingToast";
import SuccessToast from "@/Toasts/SuccessToast";

import { Loader2Icon, RefreshCcwIcon } from "lucide-react";

/* ----------------------------- types & helpers ---------------------------- */
type JwtPayload = {
  id: string;
  username: string;
  email: string;
  role: string;
};

function parseTokenRoleAndUser(token?: string | undefined): {
  username: string | null;
  role: string | null;
} {
  if (!token) return { username: null, role: null };
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as JwtPayload;
    return { username: payload.username ?? null, role: payload.role ?? null };
  } catch (err) {
    console.error("Invalid token", err);
    return { username: null, role: null };
  }
}

/* ----------------------------- small components --------------------------- */

// Icon-style button (uses your sample format). Using RefreshCcwIcon for clarity.
function ButtonIconRefresh(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  return (
    <Button
      variant="secondary"
      size="icon"
      {...props}
      className={`size-8 ${props.className ?? ""} cursor-pointer`}
    >
      <RefreshCcwIcon />
    </Button>
  );
}

// Loading button shown while request is in-flight (your sample)
function ButtonLoading() {
  return (
    <Button size="sm" disabled variant={"outline"}>
      <Loader2Icon className="animate-spin " />
    </Button>
  );
}

/* --------------------------------- Nav ----------------------------------- */
const triggerClass =
  "bg-transparent text-xl font-bold px-3 py-2 rounded-md transition-colors hover:bg-blue-300/20 hover:backdrop-blur-sm";
const contentClass =
  "group-data-[viewport=false]/navigation-menu:bg-blue-300/20 group-data-[viewport=false]/navigation-menu:backdrop-blur-[12px] rounded-md p-2";
const linkClass = "font-semibold block px-3 py-2 rounded hover:bg-blue-300/30";

const COOLDOWN_KEY = "roomRefreshCooldownExpiresAt"; // stores epoch ms

const Nav: React.FC = () => {
  const token = Cookies.get("token");
  const { role } = parseTokenRoleAndUser(token);

  const [loading, setLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

  const menuSections: Array<{
    key: string;
    label: string;
    adminOnly?: boolean;
    items: { label: string; href: string }[];
  }> = [
      {
        key: "rooms",
        label: "Rooms",
        adminOnly: true,
        items: [
          { label: "Get All", href: "/rooms/AllRooms" },
          { label: "Create", href: "/rooms/create" },
        ],
      },
      {
        key: "customers",
        label: "Customers",
        items: [
          { label: "Create", href: "/customer/create" },
          { label: "Remove", href: "/customer/remove" },
          { label: "Get All", href: "/customer/get-all" },
        ],
      },
      {
        key: "reservations",
        label: "Reservations",
        items: [
          { label: "Reserve", href: "/reservations/search" },
          { label: "Remove", href: "/reservations/remove" },
          { label: "Check-in", href: "/reservations/checkin" },
          { label: "Check-out", href: "/reservations/search" },
        ],
      },
    ];

  // compute and start countdown from localStorage expiry (persist cooldown across reloads)
  useEffect(() => {
    const computeRemaining = () => {
      const expiresAt = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
      const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      setCooldownSeconds(remaining);
    };

    computeRemaining();
    const interval = setInterval(computeRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  // helper to start cooldown and persist expiry
  const startCooldown = (seconds: number) => {
    const expiresAt = Date.now() + seconds * 1000;
    localStorage.setItem(COOLDOWN_KEY, String(expiresAt));
    setCooldownSeconds(seconds);
  };

  const handleRefresh = async () => {
    // if cooldown active → show toast with remaining and return
    if (cooldownSeconds > 0) {
      ErrorToast(
        `Please wait ${cooldownSeconds} second${cooldownSeconds === 1 ? "" : "s"
        } before refreshing.`
      );
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      LoadingToast("Refreshing Rooms...");

      const res = await fetch(`${Url}/Admin/room/refresh`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        // try to read message if any
        let text = "Failed to refresh";
        try {
          const body = await res.text();
          if (body) text = `${text}: ${body}`;
        } catch { }
        throw new Error(text);
      }

      SuccessToast("Room prices refreshed ✅");
      startCooldown(30); // start 30s cooldown
    } catch (err) {
      console.error(err);
      ErrorToast("Error refreshing prices ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav
      className="w-full flex flex-wrap items-center justify-between sticky top-0 z-50 
                    backdrop-blur-[25px] px-6 py-3 shadow-lg mb-6 bg-white/5"
    >
      <div className="flex items-center gap-6">
        {/* Logo */}
        <div className="p-0 mr-3">
          <Logo />
        </div>

        {/* Navigation Menu (hidden on mobile, visible on md+) */}
        <NavigationMenu viewport={false} className="hidden md:block">
          <NavigationMenuList>
            {/* Home */}
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/app/"
                className="text-xl font-bold px-3 py-2 rounded-md hover:bg-blue-300/20"
              >
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* Sections */}
            {menuSections.map((section) => {
              if (
                section.adminOnly &&
                !(role === "Admin" || role === "SuperAdmin")
              ) {
                return null;
              }

              return (
                <NavigationMenuItem key={section.key}>
                  <NavigationMenuTrigger className={triggerClass}>
                    <div className="text-xl font-bold">{section.label}</div>
                  </NavigationMenuTrigger>

                  <NavigationMenuContent className={contentClass}>
                    {section.items.map((it) => (
                      <NavigationMenuLink
                        key={it.href}
                        href={it.href}
                        className={linkClass}
                      >
                        {it.label}
                      </NavigationMenuLink>
                    ))}
                  </NavigationMenuContent>
                </NavigationMenuItem>
              );
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 sticky">
        {/* Admin-only Refresh Button */}
        {role === "Admin" || role === "SuperAdmin" ? (
          <>
            {loading ? (
              // loading state uses your ButtonLoading format
              <ButtonLoading />
            ) : (
              // icon-style button; disabled while cooldown active
              <div>
                <ButtonIconRefresh
                  onClick={handleRefresh}
                  disabled={cooldownSeconds > 0}
                  title={
                    cooldownSeconds > 0
                      ? `Cooldown: ${cooldownSeconds}s`
                      : "Refresh room prices"
                  }
                  className={
                    cooldownSeconds > 0 ? "opacity-60 cursor-not-allowed" : ""
                  }
                />
                {/* small text next to icon explaining cooldown if active */}
                {cooldownSeconds > 0 ? (
                  <span className="ml-2 text-sm text-muted-foreground">
                    Wait {cooldownSeconds}s
                  </span>
                ) : null}
              </div>
            )}
          </>
        ) : null}

        <NavbarAuthButtons />
      </div>
    </nav>
  );
};

export default Nav;
