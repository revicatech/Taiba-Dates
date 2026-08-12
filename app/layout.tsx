import type { Metadata } from "next";
import { Cairo, Tajawal, Lemonada, Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartProvider";
import CartDrawer from "@/components/cart/CartDrawer";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tibafordates.com";

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

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "طيبة للتمور",
  alternateName: "Tiba For Dates",
  url: SITE_URL,
  logo: `${SITE_URL}/assets/store.jpeg`,
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+96176993533",
    contactType: "customer service",
    availableLanguage: "Arabic",
  },
  sameAs: ["https://wa.me/96176993533"],
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "طيبة للتمور",
  url: SITE_URL,
  description:
    "منذ أجيال، نختار أجود التمور من أفضل مزارع الخليج العربي — كل تمرة حكاية من الأصالة والكرم والطعم الفريد.",
  inLanguage: "ar",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "طيبة للتمور — Tiba For Dates",
    template: "%s — طيبة للتمور",
  },
  description:
    "منذ أجيال، نختار أجود التمور من أفضل مزارع الخليج العربي — كل تمرة حكاية من الأصالة والكرم والطعم الفريد.",
  keywords: [
    "تمور", "تمر فاخر", "تمر سعودي", "تمر مدجول", "تمر محشي",
    "طيبة للتمور", "Tiba For Dates", "dates", "Medjool dates", "Saudi dates",
    "premium dates", "تمور خليجية", "تمر طبيعي",
  ],
  authors: [{ name: "طيبة للتمور" }],
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "طيبة للتمور",
    title: "طيبة للتمور — Tiba For Dates",
    description:
      "منذ أجيال، نختار أجود التمور من أفضل مزارع الخليج العربي — كل تمرة حكاية من الأصالة والكرم والطعم الفريد.",
    images: [
      {
        url: "/assets/store.jpeg",
        width: 1200,
        height: 630,
        alt: "طيبة للتمور — تمور فاخرة من مزارع الخليج",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "طيبة للتمور — Tiba For Dates",
    description: "أجود التمور من مزارع الخليج العربي.",
    images: ["/assets/store.jpeg"],
  },
  robots: { index: true, follow: true },
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
