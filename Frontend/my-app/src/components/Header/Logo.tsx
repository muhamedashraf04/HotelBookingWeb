"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { Url } from "../../../GlobalVariables"; // backend base URL

const Logo = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null); // no default logo
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncLogo = async () => {
      try {
        const storedLogo = localStorage.getItem("hotelLogo");

        // ask backend for latest logo
        const res = await axios.get(`${Url}/admin/configuration/getimageurl`);
        const latestUrl = res.data;

        if (!storedLogo) {
          localStorage.setItem("hotelLogo", latestUrl);
          setLogoUrl(latestUrl);
        } else if (storedLogo !== latestUrl) {
          localStorage.setItem("hotelLogo", latestUrl);
          setLogoUrl(latestUrl);
        } else {
          setLogoUrl(storedLogo);
        }
      } catch (err) {
        console.error("Failed to fetch logo", err);
      } finally {
        setLoading(false);
      }
    };

    void syncLogo();
  }, []);

  return (
    <div className="logo w-auto h-22 p-2 ">
      <a href="/app" target="_blank" rel="noopener noreferrer">
        {loading || !logoUrl ? (
          // Loading animation
          <div className="w-10 h-10 border-4 mt-4 ml-8 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          <img
            src={logoUrl}
            alt="Hotel Logo"
            className="w-full h-full object-contain"
          />
        )}
      </a>
    </div>
  );
};

export default Logo;
