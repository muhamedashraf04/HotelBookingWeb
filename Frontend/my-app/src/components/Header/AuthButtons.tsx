import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";

type JwtPayload = {
  id: string;
  username: string;
  email: string;
  role: string;
};

const NavbarAuthButtons = () => {
  const navigate = useNavigate();
  const token = Cookies.get("token");
  let username: string | null = null;
  let role: string | null = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1])) as JwtPayload;
      username = payload.username;
      role = payload.role;
    } catch (err) {
      console.error("Invalid token", err);
    }
  }

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/login");
  };

  const buttonClass =
    "cursor-pointer font-bold outline-4 outline-blue-500 bg-blue-500/30 hover:bg-blue-500/20 text-black mr-5";

  return (
    <div className="flex gap-3 items-center">
      {token && username && role ? (
        <>
          <div className="flex flex-col items-start mr-5">
            <span className="font-bold">{username}</span>
            <span className="text-sm text-gray-500">{role}</span>
          </div>
          <Button className={buttonClass} onClick={handleLogout}>
            Logout
          </Button>
        </>
      ) : (
        <>
          <Link to="/login">
            <Button className={buttonClass}>Login</Button>
          </Link>
        </>
      )}
    </div>
  );
};

export default NavbarAuthButtons;
