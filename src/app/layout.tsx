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
  title: "Julian Is Doing",
  description: "Building apps with AI tools • Getting back in touch with my creative side • Creating daily content and documenting it all",
  keywords: ["Julian", "AI tools", "building in public", "content creation", "journaling app"],
  authors: [{ name: "Julian Albou" }],
  openGraph: {
    title: "Julian Is Doing",
    description: "Building apps with AI tools • Getting back in touch with my creative side • Creating daily content and documenting it all",
    url: "https://julianisdoing.com",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Julian Is Doing", 
    description: "Building apps with AI tools • Getting back in touch with my creative side • Creating daily content and documenting it all",
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
