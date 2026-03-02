import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl || "https://armeriapalmetto.it"),
  title: {
    default: "Armeria Palmetto",
    template: "%s | Armeria Palmetto",
  },
  description:
    "Armeria Palmetto — Vendita armi, munizioni, fuochi artificiali a Brescia",
  openGraph: {
    title: "Armeria Palmetto",
    description:
      "Armeria Palmetto — Vendita armi, munizioni, fuochi artificiali a Brescia",
    locale: "it_IT",
    type: "website",
    images: [
      {
        url: "/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Armeria Palmetto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Armeria Palmetto",
    description:
      "Armeria Palmetto — Vendita armi, munizioni, fuochi artificiali a Brescia",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
