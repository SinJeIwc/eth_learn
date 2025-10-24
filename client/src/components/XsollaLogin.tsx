"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    XL: {
      init: (options: { projectId: string; callbackUrl: string }) => void;
      loginPopup: (options: {
        callback: (data: { token: string }) => void;
        errorCallback: (error: any) => void;
      }) => void;
    };
  }
}

export default function XsollaLogin({ onLogin }: { onLogin: (token: string) => void }) {
  useEffect(() => {
    // Dynamically load the Xsolla Login Widget script
    const script = document.createElement("script");
    script.src = "https://cdn.xsolla.net/login-widget/sdk/1.0.0/xl.min.js";
    script.async = true;
    script.onload = () => {
      if (window.XL) {
        window.XL.init({
          projectId: "YOUR_XSOLLA_PROJECT_ID", // Replace with your Xsolla Project ID
          callbackUrl: window.location.origin,
        });
      }
    };
    script.onerror = () => {
      console.error("Failed to load Xsolla Login Widget script.");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleLogin = () => {
    if (window.XL) {
      window.XL.loginPopup({
        callback: (data: { token: string }) => {
          onLogin(data.token);
        },
        errorCallback: (error: any) => {
          console.error("Xsolla Login Error:", error);
        },
      });
    } else {
      console.error("Xsolla Login Widget is not initialized.");
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      Login with Xsolla
    </button>
  );
}