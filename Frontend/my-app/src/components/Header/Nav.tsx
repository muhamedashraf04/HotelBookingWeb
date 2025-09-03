import Cookies from "js-cookie";
import React from "react";
import { Link } from "react-router-dom";
import NavbarAuthButtons from "./AuthButtons";
import Logo from "./Logo";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

/* ----------------------------- types & helpers ---------------------------- */
type JwtPayload = { id: string; username: string; email: string; role: string };
function parseTokenRoleAndUser(token?: string) {
  if (!token)
    return { username: null as string | null, role: null as string | null };
  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as JwtPayload;
    return { username: payload.username ?? null, role: payload.role ?? null };
  } catch {
    return { username: null, role: null };
  }
}
export { parseTokenRoleAndUser };

/* ----------------------------- small components --------------------------- */

const triggerClass =
  "bg-transparent text-xl font-bold px-3 py-2 rounded-md transition-colors hover:bg-blue-300/5 hover:backdrop-blur-sm";

const contentClass =
  "group-data-[viewport=false]/navigation-menu:bg-blue-100/90 group-data-[viewport=false]/navigation-menu:backdrop-blur-[12px] rounded-md p-2";

const linkClass = "font-semibold block px-3 py-2 rounded hover:bg-blue-300/5";

const Nav: React.FC = () => {
  const token = Cookies.get("token") || localStorage.getItem("token") || "";
  const { role } = parseTokenRoleAndUser(token);
  const logged = !!token;
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
        { label: "Manage", href: "/customer/remove" },
      ],
    },
    {
      key: "reservations",
      label: "Reservations",
      items: [
        { label: "Reserve", href: "/reservations/search" },
        { label: "Archive", href: "/reservations/remove" },
        { label: "Check-in", href: "/reservations/checkin" },
        { label: "Check-out", href: "/reservations/checkout" },
      ],
    },
  ];

  return (
    <nav
      className="w-full flex items-center justify-between sticky top-0 z-50
                 backdrop-blur-[25px] px-6 py-3 shadow-lg mb-6 bg-blue-500/10"
      style={{ minHeight: 64 }}
    >
      {/* Left: Logo (always visible) + Menus (only when logged) */}
      <div className="flex items-center gap-6">
        <Link to={logged ? "/app" : "/login"} aria-label="Home">
          <div className="p-0 mr-0">
            <Logo />
          </div>
        </Link>

        {logged && (
          <NavigationMenu viewport={false} className="hidden md:block">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/app/"
                  className="text-xl font-bold px-3 py-2 rounded-md hover:bg-blue-300/20"
                >
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>

              {(role === "Admin" || role === "SuperAdmin") && (
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/Configure/"
                    className="text-xl font-bold px-3 py-2 rounded-md hover:bg-blue-300/20"
                  >
                    Configure
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}

              {menuSections.map((section) => {
                if (
                  section.adminOnly &&
                  !(role === "Admin" || role === "SuperAdmin")
                )
                  return null;
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

              {(role === "Admin" || role === "SuperAdmin") && (
                <NavigationMenuItem>
                  <NavigationMenuLink
                    href="/rates/edit"
                    className="text-xl font-bold px-3 py-2 rounded-md hover:bg-blue-300/20"
                  >
                    Rates
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4 sticky">
        <NavbarAuthButtons />
      </div>
    </nav>
  );
};

export default Nav;
