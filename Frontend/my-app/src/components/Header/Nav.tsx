import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Cookies from "js-cookie";
import React from "react";
import NavbarAuthButtons from "./AuthButtons";
import Logo from "./Logo";

type JwtPayload = {
  id: string;
  username: string;
  email: string;
  role: string;
};

const triggerClass =
  "bg-transparent text-xl font-bold px-3 py-2 rounded-md transition-colors hover:bg-blue-300/20 hover:backdrop-blur-sm";
const contentClass =
  "group-data-[viewport=false]/navigation-menu:bg-blue-300/20 group-data-[viewport=false]/navigation-menu:backdrop-blur-[12px] rounded-md p-2";
const linkClass = "font-semibold block px-3 py-2 rounded hover:bg-blue-300/30";

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

const Nav: React.FC = () => {
  const token = Cookies.get("token");
  const { username, role } = parseTokenRoleAndUser(token);

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
        { label: "All Room", href: "/rooms/get-all" },
        { label: "Create", href: "/rooms/create" },
        { label: "Edit", href: "/rooms/edit" },
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
        { label: "Check-in", href: "/reservations/get-all" },
        { label: "Check-out", href: "/reservations/search" },
      ],
    },
  ];

  return (
    <nav className="h-22 flex items-center justify-between sticky top-0 z-50 backdrop-blur-[25px] px-6 py-3 shadow-lg mb-6 bg-white/5">
      <div className="flex items-center gap-6">
        <div className="p-0 mr-3">
          <Logo />
        </div>

        <NavigationMenu viewport={false} className="scale-105">
          <NavigationMenuList>
            {/* Home - single link, styled like others */}
            <NavigationMenuItem>
              <NavigationMenuLink
                href="/app/"
                className="text-xl font-bold px-3 py-2 rounded-md hover:bg-blue-300/20"
              >
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>

            {/* other sections */}
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

      {/* Right side: Auth buttons (shows login/register or username+logout) */}
      <div className="flex items-center">
        <NavbarAuthButtons />
      </div>
    </nav>
  );
};

export default Nav;
