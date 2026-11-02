import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { StorefrontShell } from "@/components/layout/StorefrontShell";
import { Toaster } from "sonner";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LUMERO | Modern spaces. Better living. | Premium Home Décor",
  description:
    "Discover minimal, Scandinavian and contemporary home décor. Architectural lighting, natural travertine, ceramic planters, and everyday home essentials.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable} scroll-smooth`}>
      <body className="min-h-screen bg-[#FAF8F5] text-stone-900 font-sans antialiased flex flex-col selection:bg-stone-900 selection:text-white">
        <AuthProvider>
          <CartProvider>
            {/* Top-Right Corner Toaster (Sonner) */}
            <Toaster
              position="top-right"
              richColors
              closeButton
              theme="light"
              toastOptions={{
                style: {
                  borderRadius: "1rem",
                  border: "1px solid #E7E5E4",
                  fontFamily: "var(--font-sans)",
                },
              }}
            />

            <StorefrontShell>{children}</StorefrontShell>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
