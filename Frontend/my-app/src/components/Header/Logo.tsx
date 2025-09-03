"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { Url } from "../../../GlobalVariables"; // backend base URL

const Logo = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncLogo = async () => {
      try {
        const storedLogo = localStorage.getItem("hotelLogo");

        // if a logo is already stored, show it immediately
        if (storedLogo) {
          setLogoUrl(storedLogo);
        }

        // always fetch the latest logo
        const res = await axios.get(`${Url}/admin/configuration/getimageurl`);
        const latestUrl = res.data;

        if (!storedLogo || storedLogo !== latestUrl) {
          localStorage.setItem("hotelLogo", latestUrl);
          setLogoUrl(latestUrl);
        }
      } catch (err) {
        console.error("Failed to fetch logo", err);
      } finally {
        setLoading(false);
      }
    };

    void syncLogo();
  }, []);

  const storedLogo =
    typeof window !== "undefined" ? localStorage.getItem("hotelLogo") : null;

  return (
    <div className="logo w-auto max-w-xs h-22 p-2 ">
      <a href="/app" rel="noopener noreferrer">
        {loading && !storedLogo ? (
          // Spinner if nothing stored and still fetching
          <div className="w-10 h-10 border-4 mt-4 ml-8 border-black border-t-transparent rounded-full animate-spin" />
        ) : (
          // Show either stored logo or freshly fetched logo
          <img
            src={logoUrl || storedLogo || ""}
            alt="Hotel Logo"
            className="w-full h-full object-contain"
          />
        )}
      </a>
    </div>
  );
};

export default Logo;
