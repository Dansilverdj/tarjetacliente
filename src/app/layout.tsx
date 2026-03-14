import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "tarjetacliente.vip — Programa de Lealtad Premium",
  description: "La plataforma de fidelización más exclusiva para tu negocio. Tarjetas digitales para Apple Wallet y Google Wallet.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://tarjetacliente.vip"),
  openGraph: {
    title: "tarjetacliente.vip",
    description: "Programa de lealtad premium con Apple Wallet y Google Wallet",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${outfit.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  );
}
