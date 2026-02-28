"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export function AppleSplashPWA() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // Only run on iOS devices
    const isIos = /iPhone|iPad|iPod/.test(
      typeof navigator !== "undefined" ? navigator.userAgent : "",
    );
    if (!isIos) return;

    // If already in standalone mode, we don't need to generate it.
    // However, generating it doesn't hurt and ensures it's there if iOS checks it for caching.

    // Check if the link already exists to avoid redundant generation
    if (document.querySelector('link[rel="apple-touch-startup-image"]')) return;

    const generateSplash = () => {
      // Use window.screen.width/height which represent CSS pixels,
      // multiplied by devicePixelRatio to get exact physical pixel dimensions
      const width = window.screen.width * window.devicePixelRatio;
      const height = window.screen.height * window.devicePixelRatio;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Theme matching: Use #000000 for dark mode, #ffffff for light mode
      const isDark =
        resolvedTheme === "dark" ||
        (resolvedTheme === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches);

      ctx.fillStyle = isDark ? "#000000" : "#ffffff";
      ctx.fillRect(0, 0, width, height);

      // Draw Logo
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Logo size: 200px CSS equivalent
        const logoSize = 200 * window.devicePixelRatio;
        const x = (width - logoSize) / 2;

        // Wait, SplashScreen uses flex-col with gap-6. Logo is centered vertically.
        // We will just center it natively exactly in the middle.
        const y = (height - logoSize) / 2;

        ctx.drawImage(img, x, y, logoSize, logoSize);

        try {
          // Convert to data URI
          const dataURI = canvas.toDataURL("image/png");

          // Inject link pointing to the generated image
          const link = document.createElement("link");
          link.rel = "apple-touch-startup-image";
          link.href = dataURI;
          // Setting the exact media query for this device's resolution helps iOS Safari bind it properly
          link.media = `(device-width: ${window.screen.width}px) and (device-height: ${window.screen.height}px)`;

          document.head.appendChild(link);
        } catch (e) {
          console.error("[PWA Splash] Error generating splash:", e);
        }
      };
      img.src = "/assets/logo_web.png";
    };

    // Give it a tiny delay to ensure the DOM is completely ready or theme is resolved
    const timer = setTimeout(generateSplash, 500);
    return () => clearTimeout(timer);
  }, [resolvedTheme]);

  return null;
}
