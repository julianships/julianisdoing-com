"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

// Calculate days since Julian's journey started
function getDaysSinceStart() {
  // Julian's journey start date (Day 1 was October 21, 2024)
  const journeyStartDate = new Date('2024-10-21');
  const today = new Date();
  
  // Reset both dates to midnight to avoid timezone issues
  journeyStartDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - journeyStartDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 because Oct 21 was day 1
  
  return Math.max(1, diffDays); // Ensure it's at least day 1
}

export function Typewriter() {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
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