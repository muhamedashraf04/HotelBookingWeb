// src/lib/axiosInstance.ts
import axios from "axios";
import Cookies from "js-cookie";
import { Url } from "../GlobalVariables";

const axiosInstance = axios.create({
  baseURL: Url,
});

axiosInstance.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
