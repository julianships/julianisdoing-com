"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  ExternalLink, 
  Github, 
  Instagram, 
  Music, 
  Video, 
  Mail,
  Twitter,
  Youtube,
  Smartphone,
  Package,
  Calendar,
  BookOpen,
  Zap
} from "lucide-react";

const links = [
  {
    title: "Latest Content",
    url: "https://tiktok.com/@julianisdoing",
    icon: Video,
    description: "Daily updates on building, creating, and learning",
    featured: true
  },
  {
    title: "TikTok",
    url: "https://tiktok.com/@julianisdoing", 
    icon: Video,
    description: "Building apps, learning music, documenting the journey"
  },
  {
    title: "Instagram",
    url: "https://instagram.com/julianisdoing",
    icon: Instagram,
    description: "Behind the scenes and visual updates"
  },
  {
    title: "YouTube",
    url: "https://youtube.com/@julianisdoing",
    icon: Youtube,
    description: "Longer form content and tutorials"
  },
  {
    title: "Twitter/X",
    url: "https://x.com/julianisdoing",
    icon: Twitter,
    description: "Real-time thoughts and quick updates"
  },
  {
    title: "Content OS App",
    url: "#",
    icon: Smartphone,
    description: "The app I'm building for content creators"
  },
  {
    title: "Music Production",
    url: "#",
    icon: Music,
    description: "Learning beats and music creation"
  },
  {
    title: "Physical Product Journey",
    url: "#",
    icon: Package,
    description: "Manufacturing and product development"
  },
  {
    title: "GitHub Projects",
    url: "https://github.com/julianships",
    icon: Github,
    description: "Code, projects, and open source work"
  },
  {
    title: "AI Tools Stack",
    url: "#",
    icon: Zap,
    description: "The AI tools I use to build without coding"
  },
  {
    title: "Contact",
    url: "mailto:julian@julianisdoing.com",
    icon: Mail,
    description: "Get in touch for collaborations"
  }
];

// Calculate days since starting date
function getDaysSinceStart() {
  // Starting date - set to make today day 39 (38 days ago + today = 39)
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 38); // 38 days ago makes today day 39
  
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

export default function LinksPage() {
  const [dayCount, setDayCount] = useState(39);

  // Update day count on component mount
  useEffect(() => {
    setDayCount(getDaysSinceStart());
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
          {/* Profile placeholder */}
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-accent/20 to-accent/5 rounded-full flex items-center justify-center border border-border/50">
            <div className="text-2xl">👨‍💻</div>
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
                onClick={() => {
                  if (link.url.startsWith('mailto:')) {
                    window.location.href = link.url;
                  } else {
                    window.open(link.url, '_blank');
                  }
                }}
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