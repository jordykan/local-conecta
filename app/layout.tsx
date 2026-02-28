import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { RealtimeProvider } from "@/lib/contexts/RealtimeContext";
import NextTopLoader from "nextjs-toploader";
import { PWAInitializer } from "@/components/PWAInitializer";
import { InstallPrompt } from "@/components/InstallPrompt";
import { PushNotificationManager } from "@/components/PushNotificationManager";
import { AuthSubscriptionSync } from "@/components/AuthSubscriptionSync";
import { SplashScreen } from "@/components/SplashScreen";

const notoSans = Noto_Sans({ variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mercadito — Descubre negocios locales",
  description:
    "Encuentra, aparta y conecta con negocios locales de tu comunidad. Explora el directorio, descubre promociones y apoya lo local.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mercadito",
  },
  applicationName: "Mercadito",
  keywords: [
    "negocios locales",
    "reservas",
    "servicios",
    "productos",
    "comunidad",
  ],
  authors: [{ name: "Mercadito" }],
  formatDetection: {
    telephone: false,
  },
};

// Prevent iOS Safari from zooming the page when virtual keyboard opens/closes.
// `interactiveWidget: 'resizes-content'` keeps the layout viewport stable so
// the page doesn't jump when the keyboard dismisses.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: "resizes-content",
  themeColor: "#ea580c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={notoSans.variable} suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextTopLoader />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RealtimeProvider>
            <SplashScreen />
            <PWAInitializer />
            {children}
            <InstallPrompt />
            <PushNotificationManager />
            <AuthSubscriptionSync />
            <Toaster
              closeButton={true}
              position="top-right"
              richColors={true}
            />
          </RealtimeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
