import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Julian Is Doing - Links",
  description: "All my links in one place - follow the journey of building apps with AI tools and creating daily content.",
  openGraph: {
    title: "Julian Is Doing - Links",
    description: "Building apps with AI tools • Getting back in touch with my creative side • Creating daily content and documenting it all",
    url: "https://julianisdoing.com/links",
    type: "profile",
  },
  twitter: {
    card: "summary",
    title: "Julian Is Doing - Links",
    description: "Building apps with AI tools • Getting back in touch with my creative side • Creating daily content and documenting it all",
  },
};

export default function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 