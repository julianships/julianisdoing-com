import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Julian Albou",
  description:
    "Generalist building Victus, AI-driven systems, and live products across mobile and web.",
  keywords: [
    "Julian Albou",
    "Victus",
    "AI-driven development",
    "mobile app distribution",
    "PhotoCV.ai",
    "founder",
    "engineer",
  ],
  authors: [{ name: "Julian Albou" }],
  openGraph: {
    title: "Julian Albou",
    description:
      "Generalist building Victus, AI-driven systems, and live products across mobile and web.",
    url: "https://julianisdoing.com",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Julian Albou",
    description:
      "Generalist building Victus, AI-driven systems, and live products across mobile and web.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
