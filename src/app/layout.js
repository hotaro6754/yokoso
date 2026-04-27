// src\app\layout.js
import { Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/context/SidebarContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import AuthLoader from "@/components/AuthLoader";
import { Toaster } from "react-hot-toast";
import { Toaster as SonnerToaster } from "sonner";
import TaxRegimePopupManager from "@/components/common/TaxRegimePopupManager";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Zodeck Portal",
  description: "Human Resource Management System",
  icons: {
    icon: "/images/logo/zodeck_favicon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning={true}
        className={`${outfit.variable} ${geistMono.variable} font-outfit antialiased dark:bg-gray-900`}
      >
        <ThemeProvider>
          <AuthProvider>
            <AuthLoader>
              <SidebarProvider>
                {children}
                <TaxRegimePopupManager />
                <Toaster position="top-right" />
                <SonnerToaster position="top-right" richColors />
              </SidebarProvider>
            </AuthLoader>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
