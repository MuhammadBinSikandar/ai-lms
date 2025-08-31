import "./globals.css";
import {Outfit} from "next/font/google";
import { SupabaseProvider } from "./supabase-provider";
import { Toaster } from "@/components/ui/sonner"

const outfit=Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata = {
  title: "AI LMS SaaS",
  description: "AI-powered Learning Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={outfit.className}
      >
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
        <Toaster />
      </body>
    </html>
  );
}
