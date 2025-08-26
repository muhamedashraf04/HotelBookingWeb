"use client";

import Header from "@/components/Header/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import type { ChangeEvent, FormEvent } from "react";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { Url } from "../../GlobalVariables";

function Register() {
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(`${Url}/api/auth/register`, form);

      toast.success("Registration successful 🎉", {
        description: "Redirecting to login...",
      });

      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    } catch (err: any) {
      if (err.response) {
        toast.error("Registration failed ❌", {
          description: err.response.data || "Something went wrong.",
        });
      } else {
        toast.error("Server not reachable ❌");
      }
    } finally {
      setIsLoading(false);
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
          <h1 className="text-2xl font-bold text-center">Create an account</h1>
          <p className="text-center text-gray-500 text-sm">
            Sign up to continue
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
              <Label htmlFor="email" className="pl-1 mb-2.5 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="phoneNumber" className="pl-1 mb-2.5 block">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={form.phoneNumber}
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
              !isLoading ? "cursor-pointer" : "cursor-not-allowed"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </Button>

          <p className="text-sm text-gray-500 text-center">
            Already have an account?{" "}
            <a href="/login" className="text-blue-500 hover:underline">
              Login
            </a>
          </p>
        </form>
        <Toaster richColors />
      </div>
    </>
  );
}

export default Register;
