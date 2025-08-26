"use client";

import Header from "@/components/Header/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import Cookies from "js-cookie";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { Url } from "../../GlobalVariables";

function Login() {
  const [form, setForm] = useState({
    userName: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${Url}/api/auth/login`, form);
      Cookies.set("token", res.data.token, { expires: 1 });

      toast.success("Login successful 🎉", {
        description: "Redirecting...",
      });

      setTimeout(() => {
        window.location.href = "/";
      }, 1200);
    } catch (err: any) {
      if (err.response) {
        toast.error("Login failed", {
          description: err.response.data || "Invalid credentials.",
        });
      } else {
        toast.error("Server not reachable");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-6 rounded-lg border p-6 shadow-md bg-white"
        >
          <h1 className="text-2xl font-bold text-center">Login</h1>
          <p className="text-center text-gray-500 text-sm">
            Enter your username and password
          </p>

          <div className="space-y-4">
            <div>
              <Label htmlFor="userName" className="pl-1 mb-2.5 block">
                Username
              </Label>
              <Input
                id="userName"
                value={form.userName}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="pl-1 mb-2.5 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className={`w-full ${
              !loading ? "cursor-pointer" : "cursor-not-allowed"
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </Button>

          <p className="text-sm text-gray-500 text-center">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-gray-900 hover:underline">
              Register
            </a>
          </p>
        </form>
        <Toaster richColors />
      </div>
    </>
  );
}

export default Login;
