"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { 
  ExternalLink, 
  Instagram, 
  Video, 
  Twitter,
  Youtube,
  BookOpen,
  Timer, // Added Timer icon
  Leaf, // Added Leaf icon for Plant Snap AI
  Sparkles // Added Sparkles icon for Polish'd app
} from "lucide-react";

const links = [
  {
    title: "Polish'd",
    url: "https://www.vibecodeapp.com/projects/8ab67800-215b-4449-afce-2fe7b0e33b3b",
    icon: Sparkles,
    description: "My latest product, check it out.",
    featured: true
  },
  {
    title: "Plant Snap AI",
    url: "https://www.vibecodeapp.com/projects/1117df31-e303-4876-9876-7bebb276b243",
    icon: Leaf,
    description: "Built using Vibe Code.",
    featured: false
  },
  {
    title: "HIIT Timer App",
    url: "https://www.vibecodeapp.com/projects/2335d2e3-c384-4d94-b67c-9a06f0a68662",
    icon: Timer,
    description: "Built using Vibe Code.",
    featured: false,
  },
  {
    title: "Journaling App",
    url: "https://www.vibecodeapp.com/projects/4e7ea1de-ea55-4092-acc9-02942341757a",
    icon: BookOpen,
    description: "Built using Vibe Code.",
    featured: false // No longer the featured item
  },
  {
    title: "TikTok",
    url: "https://www.tiktok.com/@julianisdoing", 
    icon: Video,
    description: "Daily updates on building, creating, and learning"
  },
  {
    title: "Instagram",
    url: "https://www.instagram.com/julianisdoing/",
    icon: Instagram,
    description: "Behind the scenes and visual updates"
  },
  {
    title: "YouTube",
    url: "https://www.youtube.com/@JulianIsDoing",
    icon: Youtube,
    description: "Longer form content and tutorials"
  },
  {
    title: "X (Twitter)",
    url: "https://x.com/julianisdoing",
    icon: Twitter,
    description: "Real-time thoughts and quick updates"
  }
];

// Calculate days since Julian's journey started
function getDaysSinceStart() {
  // Julian's journey start date (Day 1 was June 6, 2025)
  // Month is 0-indexed in JS, so 5 is June.
  const journeyStartDate = new Date(2025, 5, 6);
  const today = new Date();
  
  // Reset both dates to midnight to avoid timezone issues
  journeyStartDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - journeyStartDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 because June 6 was day 1
  
  return Math.max(1, diffDays); // Ensure it's at least day 1
}

export default function LinksPage() {
  const [dayCount, setDayCount] = useState(1);

  // Update day count on component mount and clear any cache
  useEffect(() => {
    // Clear any old sessionStorage data
    sessionStorage.removeItem('julianDayCount');
    sessionStorage.removeItem('julianLastCheck');
    
    // Get fresh day count
    const currentDay = getDaysSinceStart();
    setDayCount(currentDay);
    
    // Store today's calculation
    sessionStorage.setItem('julianDayCount', currentDay.toString());
    sessionStorage.setItem('julianLastCheck', new Date().toDateString());
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4">
      <div className="max-w-md mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          {/* Profile picture */}
          <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-accent/30">
            <Image
              src="/profile.jpg"
              alt="Julian's profile picture"
              width={96}
              height={96}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gradient">Julian Is Doing</h1>
            <p className="text-muted-foreground">
              Building apps with AI tools • Getting back in touch with my creative side • 
              Creating daily content and documenting it all
            </p>
            <div className="text-sm text-accent font-medium">
              Day {dayCount} and counting 🚀
            </div>
          </div>
        </motion.div>

        {/* Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-3"
        >
          {links.map((link, index) => (
            <motion.div
              key={link.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <Button
                variant={link.featured ? "primary" : "secondary"}
                className={`w-full justify-start p-4 h-auto group relative overflow-hidden ${
                  link.featured ? "shadow-glow" : ""
                }`}
                onClick={() => window.open(link.url, '_blank')}
              >
                <div className="flex items-center gap-4 w-full">
                  <div className={`p-2 rounded-lg ${
                    link.featured 
                      ? "bg-white/20" 
                      : "bg-accent/10 group-hover:bg-accent/20"
                  } transition-colors`}>
                    <link.icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 text-left">
                    <div className="font-medium">{link.title}</div>
                    <div className={`text-sm ${
                      link.featured 
                        ? "text-white/80" 
                        : "text-muted-foreground"
                    }`}>
                      {link.description}
                    </div>
                  </div>
                  
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center pt-8 space-y-4"
        >
          <div className="text-sm text-muted-foreground">
            You can just do things.
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('/', '_blank')}
            className="text-accent hover:text-accent-hover"
          >
            Visit julianisdoing.com
          </Button>
        </motion.div>

      </div>
    </div>
  );
} 