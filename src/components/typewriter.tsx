"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";

type Project = {
  title: string;
  label: string;
  description: string;
  details: string[];
  href?: string;
  cta?: string;
  featured?: boolean;
};

const projects: Project[] = [
  {
    title: "Victus",
    label: "Live iOS app",
    description:
      "A gamified self-improvement app built around discipline, habits, and consistency.",
    details: [
      "Current focus: product iteration, retention, and mobile distribution.",
      "Shipped publicly and live on the App Store.",
    ],
    href: "https://apps.apple.com/us/app/victus-discipline-habits/id6754204999",
    cta: "Open on App Store",
    featured: true,
  },
  {
    title: "Victus Content Engine",
    label: "Internal AI pipeline",
    description:
      "An internal system for automated video generation, scheduling, posting, and analytics built to support Victus growth.",
    details: [
      "Designed to increase output without increasing operational overhead.",
      "Connects content creation, distribution, and feedback loops into one system.",
    ],
  },
  {
    title: "Agentic Build Stack",
    label: "Workflow",
    description:
      "My day-to-day build workflow evolved from Cursor to Claude CLI to Codex Desktop, with a focus on shipping faster and learning in public.",
    details: [
      "Used across product experiments, internal tools, and growth systems.",
      "Optimized for leverage, iteration speed, and staying close to the frontier.",
    ],
  },
];

export function Typewriter() {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  const summary = `Hi, my name is Julian Albou

I'm a generalist with a strong bias toward action, leverage, and learning fast. I've spent most of my career in high-stakes environments, helping small teams punch above their weight. My experience spans engineering, business development, sales, events, distribution, product, design, and growth.

Over the last year, I've gone all in on AI-driven development. I'm currently building Victus, a gamified self-improvement app, and building the systems around it, including an internal pipeline for automated video generation, scheduling, posting, and analytics. These days I spend most of my time thinking about AI tooling, product iteration, and mobile app distribution.`;

  useEffect(() => {
    if (currentIndex < summary.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(summary.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      }, 50);

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
    <div className="bg-background">
      <section className="min-h-screen px-6">
        <div className="flex min-h-screen items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-3xl text-center"
          >
            <pre className="font-mono text-lg leading-relaxed whitespace-pre-wrap text-foreground md:text-xl">
              {displayedText}
              <span
                className={`ml-1 inline-block h-6 w-0.5 bg-accent ${
                  showCursor ? "opacity-100" : "opacity-0"
                }`}
              />
            </pre>
          </motion.div>
        </div>
      </section>

      <section className="px-6 pb-20 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.18 }}
          className="mx-auto max-w-5xl space-y-5"
        >
          <div className="space-y-3 text-center">
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">
              Project Spotlight
            </p>
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl">
              A few things I&apos;m building right now
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base">
              The quickest way to understand me is to look at the products and
              systems I spend my time on.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project, index) => (
              <motion.article
                key={project.title}
                initial={{ opacity: 0, y: 28, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{
                  duration: 0.65,
                  delay: 0.1 + index * 0.1,
                  ease: "easeOut",
                }}
                viewport={{ once: true, amount: 0.24 }}
                className={`rounded-2xl border border-border bg-muted/70 p-6 text-left shadow-md backdrop-blur-sm ${
                  project.featured ? "md:col-span-2" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-accent">
                      {project.label}
                    </p>
                    <h3 className="text-xl font-semibold text-foreground">
                      {project.title}
                    </h3>
                  </div>
                  {project.featured ? (
                    <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.24em] text-accent">
                      <Sparkles className="h-3.5 w-3.5" />
                      Current focus
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 text-base leading-7 text-foreground/90">
                  {project.description}
                </p>

                <div className="mt-5 space-y-2">
                  {project.details.map((detail) => (
                    <p
                      key={detail}
                      className="border-l border-border pl-4 text-sm leading-6 text-muted-foreground"
                    >
                      {detail}
                    </p>
                  ))}
                </div>

                {project.href ? (
                  <div className="mt-6">
                    <a
                      href={project.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent/15"
                    >
                      {project.cta}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                ) : null}
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
