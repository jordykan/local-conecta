import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { RealtimeProvider } from "@/lib/contexts/RealtimeContext";
import NextTopLoader from "nextjs-toploader";

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
  title: "Local Conecta — Descubre negocios locales",
  description:
    "Encuentra, aparta y conecta con negocios locales de tu comunidad. Explora el directorio, descubre promociones y apoya lo local.",
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
            {children}
            <Toaster closeButton={true} position="top-right" richColors={true} />
          </RealtimeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
