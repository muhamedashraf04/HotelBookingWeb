import Cookies from "js-cookie";

type JwtPayload = {
  id: string;
  username: string;
  email: string;
  role: string;
};

export function getUserRole(): string | null {
  const token = Cookies.get("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1])) as JwtPayload;
    return payload.role;
  } catch {
    return null;
  }
}
