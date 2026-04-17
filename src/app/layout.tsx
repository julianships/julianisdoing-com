import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Julian Albou",
  description:
    "Generalist building Victus and AI-driven systems for product iteration, content, and mobile app distribution.",
  keywords: [
    "Julian Albou",
    "AI-driven development",
    "mobile app distribution",
    "Victus",
    "AI pipelines",
    "founder",
    "growth",
  ],
  authors: [{ name: "Julian Albou" }],
  openGraph: {
    title: "Julian Albou",
    description:
      "Generalist building Victus and AI-driven systems for product iteration, content, and mobile app distribution.",
    url: "https://julianisdoing.com",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Julian Albou",
    description:
      "Generalist building Victus and AI-driven systems for product iteration, content, and mobile app distribution.",
  },
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
        {children}
      </body>
    </html>
  );
}
