import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Julian Albou",
  description:
    "AI-first software developer building mobile products, automation systems, and distribution tooling.",
  keywords: [
    "Julian Albou",
    "Victus",
    "AI-first developer",
    "software developer",
    "mobile app development",
    "automation systems",
    "PhotoCV.ai",
    "engineer",
  ],
  authors: [{ name: "Julian Albou" }],
  openGraph: {
    title: "Julian Albou",
    description:
      "AI-first software developer building mobile products, automation systems, and distribution tooling.",
    url: "https://julianisdoing.com",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Julian Albou",
    description:
      "AI-first software developer building mobile products, automation systems, and distribution tooling.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
