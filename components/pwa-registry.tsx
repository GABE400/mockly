"use client";

import { useEffect } from "react";

export function PWARegistry() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("Muckly Service Worker registered successfully:", reg.scope);
          })
          .catch((err) => {
            console.error("Muckly Service Worker registration failed:", err);
          });
      });
    }
  }, []);

  return null;
}
