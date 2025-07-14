"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

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

export function Typewriter() {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [dayCount, setDayCount] = useState(39);

  // Update day count on component mount
  useEffect(() => {
    setDayCount(getDaysSinceStart());
  }, []);

  const summary = `Julian Is Doing

Building apps with AI tools.
Getting back in touch with my creative side.
Creating daily content and documenting it all.

This is day ${dayCount} and counting.

You can just do things.`;

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

  // Reset typing animation when day count changes
  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
  }, [dayCount]);

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