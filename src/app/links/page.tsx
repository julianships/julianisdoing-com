"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { 
  ExternalLink, 
  Instagram, 
  Video, 
  Twitter,
  Youtube,
  BookOpen,
  Timer,
  Leaf,
  Sparkles,
  ListPlus, // Icon for waitlist
  ChevronDown, // Icon for accordion
  Smartphone // Icon for Vibe Code apps
} from "lucide-react";

// The new waitlist link
const waitlistLink = {
  title: "Waitlist",
  url: "https://www.notion.so/julianisdoing/Julian-s-Social-Analytics-Waitlist-27133403eb5180b3b603e9e768289971?pvs=4",
  icon: ListPlus,
  description: "Waitlist for my new social analytics app",
  featured: true
};

// Vibe Code Apps grouped together
const vibeCodeApps = [
  {
    title: "Polish'd",
    url: "https://www.vibecodeapp.com/projects/8ab67800-215b-4449-afce-2fe7b0e33b3b",
    icon: Sparkles,
    description: "AI nail scanning app",
  },
  {
    title: "Plant Snap AI",
    url: "https://www.vibecodeapp.com/projects/1117df31-e303-4876-9876-7bebb276b243",
    icon: Leaf,
    description: "Plant analyzer via picture",
  },
  {
    title: "HIIT Timer App",
    url: "https://www.vibecodeapp.com/projects/2335d2e3-c384-4d94-b67c-9a06f0a68662",
    icon: Timer,
    description: "Customizable HIIT timer",
  },
  {
    title: "Journaling App",
    url: "https://www.vibecodeapp.com/projects/4e7ea1de-ea55-4092-acc9-02942341757a",
    icon: BookOpen,
    description: "A simple journaling tool",
  },
];

// Social and other links
const socialLinks = [
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
  const [isVibeCodeOpen, setVibeCodeOpen] = useState(false);

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
        <div className="space-y-3">
          {/* Waitlist Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Button
              variant="primary"
              className="w-full justify-start p-4 h-auto group relative overflow-hidden shadow-glow"
              onClick={() => window.open(waitlistLink.url, '_blank')}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="p-2 rounded-lg bg-white/20">
                  <waitlistLink.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{waitlistLink.title}</div>
                  <div className="text-sm text-white/80">{waitlistLink.description}</div>
                </div>
                <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Button>
          </motion.div>

          {/* Social Links */}
          {socialLinks.map((link, index) => (
            <motion.div
              key={link.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + 0.1 * index }}
            >
              <Button
                variant="secondary"
                className="w-full justify-start p-4 h-auto group relative overflow-hidden"
                onClick={() => window.open(link.url, '_blank')}
              >
                <div className="flex items-center gap-4 w-full">
                  <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <link.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{link.title}</div>
                    <div className="text-sm text-muted-foreground">{link.description}</div>
                  </div>
                  <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Button>
            </motion.div>
          ))}

          {/* Vibe Code Apps Accordion */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 + 0.1 * socialLinks.length }}
            className="rounded-lg overflow-hidden border border-border/50"
          >
            <Button
              variant="secondary"
              className="w-full justify-start p-4 h-auto group relative"
              onClick={() => setVibeCodeOpen(!isVibeCodeOpen)}
            >
              <div className="flex items-center gap-4 w-full">
                <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">Apps Built with Vibe Code</div>
                  <div className="text-sm text-muted-foreground">4 projects and counting</div>
                </div>
                <motion.div
                  animate={{ rotate: isVibeCodeOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              </div>
            </Button>

            <AnimatePresence>
              {isVibeCodeOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="bg-secondary/50"
                >
                  <div className="p-3 space-y-3">
                    {vibeCodeApps.map((app) => (
                      <Button
                        key={app.title}
                        variant="ghost"
                        className="w-full justify-start p-3 h-auto group"
                        onClick={() => window.open(app.url, '_blank')}
                      >
                        <div className="flex items-center gap-4 w-full">
                          <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                            <app.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{app.title}</div>
                          </div>
                          <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

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