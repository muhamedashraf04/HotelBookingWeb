import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Logo from "./Logo";

const Nav = () => {
  return (
    <nav className="flex items-center justify-start sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ">
      <div className="bg-white p-0 mr-5">
        <Logo />
      </div>

      <NavigationMenu viewport={false}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink className="text-xl font-bold" href="/app/">
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <div className="text-xl font-bold">Rooms</div>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/rooms/get-all">
                All Room
              </NavigationMenuLink>
              <NavigationMenuLink href="/rooms/create">
                Create
              </NavigationMenuLink>
              <NavigationMenuLink href="/rooms/Edit">Edit</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <div className="text-xl font-bold">Customers</div>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="../Customer/Create">
                Create
              </NavigationMenuLink>
              <NavigationMenuLink href="/customer/remove">
                Remove
              </NavigationMenuLink>
              <NavigationMenuLink href="/customer/get-all">
                GetAll
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <div className="text-xl font-bold">Reservations</div>
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink href="/reservations/available">
                Reserve
              </NavigationMenuLink>
              <NavigationMenuLink href="/reservations/remove">
                Remove
              </NavigationMenuLink>
              <NavigationMenuLink href="/reservations/get-all">
                Check-in
              </NavigationMenuLink>
              <NavigationMenuLink href="/reservationss/available">
                Check-out
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      {/* <div className="flex justify-end ml-auto mr-10">
        <ModeToggle />
      </div> */}
    </nav>
  );
};

export default Nav;
