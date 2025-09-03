// src/lib/axiosInstance.ts
import axios from "axios";
import Cookies from "js-cookie";
import { Url } from "../GlobalVariables";
// src/api/axiosInstance.ts

export const axiosInstance = axios.create({
  baseURL: `${Url}`, // your API
  withCredentials: true,
});

// Add token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      Cookies.remove("token");
      window.location.href = "/login"; // force logout
    }
    return Promise.reject(err);
  }
);

export default axiosInstance;
