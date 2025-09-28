import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { LocationProvider } from "@/components/providers/location-provider";
import { Toaster } from "sonner";
import { TRPCReactProvider } from "@/trpc/react";
import { PageLoader } from "@/components/ui/enhanced-loader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Wing App",
  description: "Cross-platform app built with Next.js and Capacitor",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <TRPCReactProvider>
            <AuthProvider>
              <LocationProvider>
                <main className="min-h-screen">
                  <Suspense fallback={<PageLoader />}>
                    {children}
                  </Suspense>
                </main>
                <Suspense fallback={null}>
                  <Toaster />
                </Suspense>
              </LocationProvider>
            </AuthProvider>
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
