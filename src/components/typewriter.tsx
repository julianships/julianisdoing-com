"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function Typewriter() {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  const summary = `Hi, my name is Julian Albou

A curiosity-driven generalist who loves exploring new topics and interests. Currently focused on AI-driven development and mobile app distribution.

I spent four years as a founder in a high-stakes industry, driving growth through business development, conference networking, event hosting, and sales calls. We started as a small team, so my work touched marketing, design, product, growth, and more. Eventually, the business scaled to $2M+ in annual revenue.

I left my role about a year ago to reconnect with family and chase my passion for AI. Since then, I've gone deep and kept a close eye on the latest trends and meta.`;

  useEffect(() => {
    if (currentIndex < summary.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(summary.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 50); // Typing speed

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, summary]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-background">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl mx-auto text-center"
      >
        <pre className="font-mono text-lg md:text-xl leading-relaxed text-foreground whitespace-pre-wrap">
          {displayedText}
          <span className={`inline-block w-0.5 h-6 bg-accent ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
        </pre>
      </motion.div>
    </div>
  );
}
