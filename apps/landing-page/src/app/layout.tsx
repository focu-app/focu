import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import FloatingBanner from "@/components/floating-banner";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { CustomAnalytics } from "./CustomAnalytics";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://focu.app"),
  alternates: {
    canonical: "./",
  },
  title: {
    default: "Focu App - The Mindful Productivity App",
    template: "%s | Focu App",
  },
  description:
    "Transform your relationship with work through AI-powered guidance, meaningful conversations, periodic check-ins and focused work sessions.",
};

const isProduction = process.env.NODE_ENV === "production";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900`}
      >
        <FloatingBanner />
        <Header />
        {children}
        <Footer />

        <CustomAnalytics />
        {/* <LemonSqueezyAffiliate /> */}
      </body>
    </html>
  );
}
