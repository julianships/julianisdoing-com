import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Animation variants for Framer Motion
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const fadeInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const fadeInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Color utilities
export const colors = {
  brand: {
    primary: "#3b82f6",
    hover: "#2563eb",
    muted: "rgba(59, 130, 246, 0.1)"
  },
  text: {
    primary: "#ededed",
    secondary: "#a1a1a1",
    muted: "#737373"
  },
  background: {
    primary: "#0a0a0a",
    secondary: "#1a1a1a",
    muted: "#262626"
  }
} as const;

// Typography utilities
export const typography = {
  hero: "text-4xl md:text-6xl lg:text-7xl font-bold leading-tight",
  heading1: "text-3xl md:text-4xl lg:text-5xl font-bold",
  heading2: "text-2xl md:text-3xl lg:text-4xl font-semibold",
  heading3: "text-xl md:text-2xl lg:text-3xl font-semibold",
  body: "text-base md:text-lg",
  caption: "text-sm md:text-base text-muted-foreground"
} as const;

// Common component styles
export const componentStyles = {
  card: "bg-background border border-border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow",
  button: {
    primary: "bg-gradient-brand text-white px-6 py-3 rounded-lg font-medium hover:shadow-glow transition-all",
    secondary: "bg-muted text-foreground border border-border px-6 py-3 rounded-lg font-medium hover:bg-border transition-all",
    ghost: "text-foreground hover:bg-muted px-4 py-2 rounded-lg transition-all"
  },
  input: "bg-muted border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent",
  section: "min-h-screen flex items-center justify-center px-6 py-20"
} as const; 