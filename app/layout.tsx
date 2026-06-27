import type { Metadata } from "next";
import { Cairo, Tajawal, Lemonada, Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "700"],
  variable: "--font-cairo",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

const lemonada = Lemonada({
  subsets: ["arabic", "latin"],
  weight: ["700"],
  variable: "--font-lemonada",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "طيبه للتمور — Tiba For Dates",
  description:
    "منذ أجيال، نختار أجود التمور من أفضل مزارع الخليج العربي — كل تمرة حكاية من الأصالة والكرم والطعم الفريد.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVars = [
    cairo.variable,
    tajawal.variable,
    lemonada.variable,
    cormorant.variable,
    dmSans.variable,
  ].join(" ");

  return (
    <html lang="ar" dir="rtl" className={fontVars}>
      <body>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
