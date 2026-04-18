"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Star, X } from "lucide-react";
import { useState } from "react";

type ProjectLink = {
  label: string;
  href: string;
  primary?: boolean;
};

type ProjectMetric = {
  value: string;
  label: string;
};

type ProjectWorkflowStep = {
  title: string;
  body: string;
};

type ProjectDecision = {
  title: string;
  problem: string;
  solution: string;
};

type ProjectGalleryItem = {
  src: string;
  alt: string;
};

type Project = {
  id: string;
  label: string;
  title: string;
  status: string;
  summary: string;
  details?: string[];
  tileBadges?: string[];
  metrics?: ProjectMetric[];
  stack?: string[];
  workflow?: ProjectWorkflowStep[];
  considerations?: string[];
  publicSignals?: string[];
  decisions?: ProjectDecision[];
  gallery?: ProjectGalleryItem[];
  links?: ProjectLink[];
  iconSrc?: string;
};

const photocvPairs = [
  {
    before: "/projects/photocv/demo1-selfie.webp",
    after: "/projects/photocv/demo1-ai.webp",
    name: "Marie",
  },
  {
    before: "/projects/photocv/demo2-selfie.webp",
    after: "/projects/photocv/demo2-ai.webp",
    name: "Thomas",
  },
  {
    before: "/projects/photocv/demo3-selfie.webp",
    after: "/projects/photocv/demo3-ai.webp",
    name: "Claire",
  },
  {
    before: "/projects/photocv/demo4-selfie.webp",
    after: "/projects/photocv/demo4-ai.webp",
    name: "Lucas",
  },
  {
    before: "/projects/photocv/demo5-selfie.webp",
    after: "/projects/photocv/demo5-ai.webp",
    name: "Emma",
  },
  {
    before: "/projects/photocv/demo6-selfie.webp",
    after: "/projects/photocv/demo6-ai.webp",
    name: "Pierre",
  },
  {
    before: "/projects/photocv/demo7-selfie.webp",
    after: "/projects/photocv/demo7-ai.webp",
    name: "Julie",
  },
  {
    before: "/projects/photocv/demo8-selfie.webp",
    after: "/projects/photocv/demo8-ai.webp",
    name: "Alexandre",
  },
];

const photocvRailPairs = [...photocvPairs, ...photocvPairs];

const projects: Project[] = [
  {
    id: "victus",
    label: "Flagship product",
    title: "Victus",
    status: "Live on App Store",
    summary:
      "A 66-day self-improvement system that turns onboarding data into personalized plans, daily missions, XP progression, streaks, achievements, and a public leaderboard.",
    tileBadges: ["4.9 App Store", "985 ratings"],
    metrics: [
      {
        value: "4.9",
        label: "App Store rating",
      },
      {
        value: "985",
        label: "ratings",
      },
      {
        value: "11.3.1",
        label: "current version",
      },
      {
        value: "iOS 15+",
        label: "deployment target",
      },
    ],
    stack: [
      "Flutter / Dart client, with both Riverpod and Provider powering app state.",
      "Firebase Auth, Firestore, Functions, Messaging, Analytics, and Crashlytics for backend and lifecycle services.",
      "Hive + local habit cache + offline sync so check-ins feel instant and still reconcile correctly.",
      "RevenueCat + Superwall for subscriptions, paywalls, experiments, and purchase recovery.",
      "Mixpanel, Smartlook, Meta, and appstack integrations for attribution and behavior analysis.",
      "Separate Next.js marketing and admin surfaces around the core mobile product.",
    ],
    workflow: [
      {
        title: "Onboarding gathers the inputs that matter",
        body:
          "The app walks users through acquisition source, baseline habits, pillars, obstacles, workout preferences, and now custom habits before it ever generates a plan.",
      },
      {
        title: "Plan generation becomes the operating system",
        body:
          "Victus turns those answers into a structured 66-day journey plan, then treats that plan as the source of truth for scheduled habits and future customization.",
      },
      {
        title: "Daily execution updates real progression",
        body:
          "Completing a habit updates completion state, XP, pillar XP, rank, streak logic, achievement checks, and reminder scheduling instead of just toggling a checkbox.",
      },
      {
        title: "Retention is built into the surface area",
        body:
          "Leaderboards, rank progression, achievement art, radar/progress views, and the stoic framing all reinforce the feeling that the system is alive and worth returning to.",
      },
    ],
    considerations: [
      "How to keep the stoic / Spartan framing memorable without letting the product become theme-first and confusing.",
      "How to make XP, ranks, and streaks feel motivating without encouraging spammy or low-signal habit completion.",
      "How to let users complete habits instantly offline or on resume without corrupting XP state or streak state.",
      "How to layer monetization around the core loop so paywalls and checkout handoffs do not poison trust.",
      "How to preserve continuity after day 66 instead of dropping committed users into an empty end state.",
    ],
    publicSignals: [
      "As of April 17, 2026, the US App Store listing shows a 4.9-star rating from 985 ratings.",
      "The listing currently shows version 11.3.1, plus recent shipping around purchase tracking, trial conversion handling, onboarding clarity, and radar-style progress views.",
      "The public listing is iPhone-first in Health & Fitness, with iOS 15.0+ compatibility and a live website at getvictus.com.",
      "The subscription catalog visible on the App Store spans weekly, monthly, annual, trial, and special-offer SKUs.",
    ],
    decisions: [
      {
        title: "Make the journey plan authoritative",
        problem:
          "Schedule truth can drift quickly when habits are represented in multiple places, especially if UI state, local cache, and analytics data all start behaving like primary records.",
        solution:
          "Victus moved toward treating journey plans as the real schedule/completion source of truth, while daily check-ins became a derived store for analytics, backfill, and sync support.",
      },
      {
        title: "Stop duplicate XP from race conditions",
        problem:
          "Fast taps, resume flows, and local-first behavior create real risk that the same habit completion gets counted more than once.",
        solution:
          "The local cache and completion flow were hardened with mutex-style protection plus OfflineSyncManager orchestration so the app can stay fast without double-awarding progress.",
      },
      {
        title: "Extend the app past the original 66-day edge",
        problem:
          "A strict 66-day product sounds sharp in marketing, but a real user who finishes the program still needs the system to keep working.",
        solution:
          "Maintenance mode was added so the plan can continue past day 66 using later-week templates, instead of leaving committed users in a dead end.",
      },
      {
        title: "Ship custom habits without breaking progression",
        problem:
          "Users wanted custom habits, but open-ended habits can break XP balance, scheduling, workout logic, and notification assumptions if they are bolted on carelessly.",
        solution:
          "Custom habits were integrated as first-class data: pending custom habit models, classification, runtime resolution, and plan-generation hooks rather than a loose notes field.",
      },
      {
        title: "Stabilize monetization across platforms and handoffs",
        problem:
          "Paywall behavior, checkout recovery, and purchase syncing get messy fast when iOS, Android, and web all have slightly different runtime requirements.",
        solution:
          "Victus split platform-specific Superwall keys, improved purchase-tracking and trial-conversion handling, and added web checkout handoff logic back into the app auth flow.",
      },
    ],
    gallery: [
      {
        src: "/projects/victus/01.png",
        alt: "Victus App Store creative showing the core discipline positioning.",
      },
      {
        src: "/projects/victus/02.png",
        alt: "Victus daily mission screen with XP-driven progress.",
      },
      {
        src: "/projects/victus/04.png",
        alt: "Victus leaderboard screens showing competitive ranking.",
      },
      {
        src: "/projects/victus/05.png",
        alt: "Victus achievements screen with progression visuals.",
      },
    ],
    links: [
      {
        label: "Open on App Store",
        href: "https://apps.apple.com/us/app/victus-discipline-habits/id6754204999",
        primary: true,
      },
      {
        label: "Visit getvictus.com",
        href: "https://www.getvictus.com",
      },
    ],
    iconSrc: "/projects/victus/icon.png",
  },
  {
    id: "engine",
    label: "Technical project",
    title: "AI Content Engine",
    status: "Internal system",
    summary:
      "An internal pipeline for automated video generation, scheduling, posting, and analytics.",
    details: [
      "Built to support Victus growth without scaling content operations linearly.",
      "Connects generation, publishing, and feedback loops into one operating system.",
      "The strongest representation of how I think about AI tooling, leverage, and distribution.",
    ],
  },
  {
    id: "photocv",
    label: "Live web product",
    title: "PhotoCV.ai",
    status: "Live and monetizing",
    summary:
      "A France-first AI headshot product for CV and LinkedIn photos, built around conversion, automated delivery, and a real paid funnel.",
    metrics: [
      {
        value: "€29-59",
        label: "one-time pricing tiers",
      },
      {
        value: "10-200",
        label: "photos per order",
      },
      {
        value: "8-20",
        label: "selfies required",
      },
      {
        value: "~30 min",
        label: "average delivery target",
      },
    ],
    stack: [
      "Next.js 15 App Router with TypeScript and Tailwind driving the web product and SEO surface area.",
      "Supabase for auth, PostgreSQL data, storage, gated flows, and order state across the funnel.",
      "Stripe checkout plus webhook-driven payment confirmation and post-checkout recovery.",
      "Custom FLUX-based generation pipeline for training, prompt generation, image output, and quality filtering.",
      "Resend for lifecycle email automation, plus GA4, DataFast, Meta, and LinkedIn for attribution and funnel tracking.",
      "Vercel deployment with edge delivery, webhook handlers, and a large city/service landing-page footprint.",
    ],
    workflow: [
      {
        title: "Acquire through SEO, ads, and focused landing pages",
        body:
          "PhotoCV is built around France-first acquisition, with city pages, service pages, paid traffic, and product-led copy all pushing into the same funnel.",
      },
      {
        title: "Collect just enough input to personalize the generation",
        body:
          "Users authenticate, upload 8-20 selfies, choose style combinations, and confirm order context before the paid generation ever starts.",
      },
      {
        title: "Move from payment into generation without losing trust",
        body:
          "Stripe checkout, webhooks, order-state transitions, wait states, and email updates all need to feel reliable because users are handing over money before results exist.",
      },
      {
        title: "Deliver a usable gallery, not just raw model output",
        body:
          "The generation pipeline tunes the model, expands prompts, produces multiple outputs, filters quality, and delivers a dashboard where users can favorite and download the results.",
      },
    ],
    considerations: [
      "How much friction to add up front: enough selfies and style detail to get good outputs, but not so much that the funnel collapses.",
      "How to make preview watermarks useful for conversion without making previews feel low-trust or easy to exploit.",
      "How to keep preview-to-paid handoff clean so users do not lose the outputs they already liked.",
      "How to localize aggressively for search while keeping routing, indexing, and analytics sane.",
      "How to make an AI photo product feel reliable enough to charge money for, not just interesting enough to demo.",
    ],
    publicSignals: [
      "The live product positions itself as an AI CV and LinkedIn headshot service for French-speaking professionals who want results without a studio shoot.",
      "The documented pricing model is one-time purchase rather than subscription, with three tiers ranging from €29 to €59.",
      "The funnel is built around upload, checkout, wait-state processing, and dashboard delivery rather than a toy prompt box.",
      "The public site has expanded into city-specific and service-specific landing pages, which signals an active acquisition and SEO strategy.",
    ],
    decisions: [
      {
        title: "Preserve preview momentum instead of restarting the funnel",
        problem:
          "Users who engage with preview outputs can drop if the paid flow feels like a full reset or if the final results do not connect back to what they already saw.",
        solution:
          "Recent PhotoCV work promoted paid preview images into final results and tightened the preview-to-paid generation handoff so the experience feels continuous.",
      },
      {
        title: "Treat watermarking as a conversion system, not just a protection layer",
        problem:
          "Watermarks need to prevent abuse, but harsh treatment can also make the product feel cheap or undermine the perceived quality of the generated photo.",
        solution:
          "Recent iterations softened preview watermark treatment, then restored styled watermark assets so the previews stay branded and usable without giving away the product.",
      },
      {
        title: "Tighten attribution before scaling paid acquisition",
        problem:
          "If GA4 and ad attribution are loose, optimization gets noisy and it becomes hard to tell which search or landing work is actually paying back.",
        solution:
          "Recent repo work tightened GA4 ads attribution and focused the France search setup so growth decisions can rest on cleaner funnel data.",
      },
    ],
    gallery: [
      {
        src: "/projects/photocv/demo1-selfie.webp",
        alt: "PhotoCV input selfie example.",
      },
      {
        src: "/projects/photocv/demo1-ai.webp",
        alt: "PhotoCV generated professional headshot example.",
      },
      {
        src: "/projects/photocv/demo7-selfie.webp",
        alt: "Second PhotoCV input selfie example.",
      },
      {
        src: "/projects/photocv/demo7-ai.webp",
        alt: "Second PhotoCV generated professional headshot example.",
      },
    ],
    links: [
      {
        label: "Visit PhotoCV.ai",
        href: "https://www.photocv.ai",
        primary: true,
      },
    ],
    iconSrc: "/projects/photocv/favicon.png",
  },
  {
    id: "praise-lock",
    label: "Prayer-first app",
    title: "Praise Lock",
    status: "Live on iOS and Android",
    summary:
      "A prayer-first app blocker that locks distracting apps until the user takes a moment to worship, then hands them into a guided prayer flow instead of another doomscroll.",
    metrics: [
      {
        value: "iOS + Android",
        label: "supported platforms",
      },
      {
        value: "1.0.1+25",
        label: "current mobile build",
      },
      {
        value: "api.praiselock.com",
        label: "generation and promo API",
      },
      {
        value: "Live",
        label: "web + mobile presence",
      },
    ],
    stack: [
      "Flutter / Dart mobile app with Riverpod, go_router, and SF Pro Rounded styling for a native-feeling prayer flow.",
      "System app-lock integrations for iOS Family Controls and Android accessibility / usage access so blocked-app launches can route into the prayer journey.",
      "SharedPreferences plus Sqflite-backed prayer storage to persist blocked apps, prayer history, onboarding state, and journey progress locally.",
      "RevenueCat observer-mode billing plus Superwall paywall orchestration for subscriptions and upgrade flows across both stores.",
      "Mixpanel, Firebase Analytics, Crashlytics, Singular, Smartlook, and Meta events for instrumentation and debugging.",
      "HTTP-backed prayer generation service hitting api.praiselock.com, with repeat-avoidance logic for scripture references and recent books.",
    ],
    workflow: [
      {
        title: "Choose the distractions worth blocking",
        body:
          "Users configure the apps, categories, and web domains they want to gate, then the native lock setup checks whether the required system permissions are actually configured.",
      },
      {
        title: "Intercept the urge instead of just tracking it",
        body:
          "When a blocked app is launched or the notification route is tapped, the app-lock service converts that into a structured event so the user lands in prayer instead of slipping through a broken handoff.",
      },
      {
        title: "Generate a prayer that fits the moment",
        body:
          "The prayer generation service sends mood, intent, profile context, and recent prayer history to the API so the app can avoid stale verses and repeated references.",
      },
      {
        title: "Turn prayer into rhythm, not a one-off interruption",
        body:
          "Completed prayers feed streak data, journey state, and review / retention surfaces so the experience becomes a habit loop rather than a novelty blocker.",
      },
    ],
    considerations: [
      "How much friction is healthy: enough to interrupt compulsive app opens, but not so much that the app feels punitive or brittle.",
      "How to reconcile very different platform permission models between iOS Family Controls and Android accessibility / usage access.",
      "How to make notification taps and blocked-app launches land in the correct prayer route every time instead of producing dead ends.",
      "How to generate prayers that feel personal without repeating the same scripture references or themes too often.",
      "How to introduce subscriptions and paywalls without making a spiritual product feel transactional or spammy.",
    ],
    publicSignals: [
      "The live website positions Praise Lock as a product that locks your phone until you worship, with explicit iOS and Android availability.",
      "The support FAQ explains the core mechanic clearly: block distracting apps, trigger a moment of prayer, then unlock afterward.",
      "Both the web surface and the mobile app point to a live production API at api.praiselock.com.",
      "Recent git history shows active work on notifications, paywall integrations, platform-specific lock handling, and prayer-flow UX.",
    ],
    decisions: [
      {
        title: "Make notification tap routing a first-class path",
        problem:
          "A prayer blocker fails if blocked-app launches or notifications ever send users into the wrong screen or a dead-end state.",
        solution:
          "The app lock service now models blocked-app launches, shield actions, and notification taps as explicit event types so the prayer route can be handled consistently.",
      },
      {
        title: "Back prayer history with real persistence",
        problem:
          "Prayer streaks and journey copy lose credibility fast if local data is fragile or the app cannot reconcile prayers across sessions.",
        solution:
          "Praise Lock uses SharedPreferences for lightweight state and Sqflite-backed prayer storage so streak rebuilds and history reads stay deterministic.",
      },
      {
        title: "Avoid stale or repetitive generated prayers",
        problem:
          "AI-assisted prayer generation can feel generic if it keeps surfacing the same verse references or books back-to-back.",
        solution:
          "The API request includes recent references and recent books so the generator can explicitly reject repeats instead of pretending every response is fresh.",
      },
      {
        title: "Untangle monetization from platform edge cases",
        problem:
          "Subscriptions across iOS and Android become messy when paywall state, observer mode, and platform-specific billing expectations drift apart.",
        solution:
          "Recent work moved deeper into RevenueCat observer-mode configuration plus Superwall paywall updates so billing behavior is more consistent across both platforms.",
      },
    ],
    gallery: [
      {
        src: "/projects/praiselock/notification-tap.png",
        alt: "Praise Lock notification routing screen.",
      },
      {
        src: "/projects/praiselock/lock-screen.png",
        alt: "Praise Lock lock screen view.",
      },
      {
        src: "/projects/praiselock/pray-screen.png",
        alt: "Praise Lock prayer flow screen.",
      },
    ],
    links: [
      {
        label: "Visit praiselock.com",
        href: "https://www.praiselock.com",
        primary: true,
      },
      {
        label: "Contact support",
        href: "mailto:support@praiselock.com",
      },
    ],
    iconSrc: "/projects/praiselock/icon-full-bleed.png",
    details: [
      "Built to turn mindless app opens into a more intentional prayer ritual.",
      "Uses native lock integrations, prayer generation, and subscription infrastructure in one tight mobile loop.",
      "A good complement to Victus because it shows I build focused products, not just one flagship app.",
    ],
  },
  {
    id: "coming-soon",
    label: "Reserved slot",
    title: "Coming Soon",
    status: "In progress",
    summary:
      "A placeholder for the next app in the stack, intentionally kept visible to show momentum.",
    details: [
      "This slot is meant to stay blank until the next product is ready to be shown publicly.",
      "It gives the board a sense of movement rather than feeling like a finished archive.",
      "Once the project is public, this tile can turn into a full project card and modal.",
    ],
  },
];

const projectMap = Object.fromEntries(
  projects.map((project) => [project.id, project])
) as Record<string, Project>;

const introMeta = "Founder • Engineer • AI systems • Distribution";

const dockItems = [
  {
    id: "victus",
    icon: "V",
    imageSrc: "/projects/victus/icon.png",
    name: "Victus",
    glowClassName: "dock-item-glow-victus",
  },
  {
    id: "praise-lock",
    icon: "P",
    imageSrc: "/projects/praiselock/icon-full-bleed.png",
    name: "Praise Lock",
    glowClassName: "dock-item-glow-praise",
  },
  {
    id: "coming-soon",
    icon: "+",
    name: "Coming Soon",
    glowClassName: "dock-item-glow-neutral",
  },
];

export function Typewriter() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [featuredProjectId, setFeaturedProjectId] = useState<string>("victus");

  const selectedProject = selectedProjectId
    ? projectMap[selectedProjectId] ?? null
    : null;
  const featuredProject = projectMap[featuredProjectId] ?? projectMap.victus;
  const isVictusFeatured = featuredProject.id === "victus";
  const isPraiseFeatured = featuredProject.id === "praise-lock";
  const isComingSoonFeatured = featuredProject.id === "coming-soon";

  const hasRichContent = Boolean(
    selectedProject?.metrics ||
      selectedProject?.stack ||
      selectedProject?.workflow ||
      selectedProject?.considerations ||
      selectedProject?.publicSignals ||
      selectedProject?.decisions ||
      selectedProject?.gallery
  );

  const sectionPanelCount =
    Number(Boolean(selectedProject?.stack?.length)) +
    Number(Boolean(selectedProject?.publicSignals?.length)) +
    Number(Boolean(selectedProject?.considerations?.length));

  return (
    <>
      <main className="presentation-page">
        <section className="presentation-stage px-4 py-3 md:px-6 md:py-4">
          <div className="mx-auto max-w-[1500px]">
            <div className="presentation-board">
              <section className="presentation-tile tile-intro intro-tile">
                <div className="intro-body">
                  <p className="presentation-kicker">Julian Albou</p>
                  <div className="intro-text">
                    <h1 className="intro-title">
                      Generalist with a bias toward action, leverage, and
                      learning fast.
                    </h1>
                    <p className="intro-copy">
                      Most of my career has been in high-stakes environments,
                      helping small teams punch above their weight across
                      engineering, distribution, product, design, and growth.
                    </p>
                    <p className="intro-copy">
                      Right now I&apos;m focused on AI-driven development,
                      mobile products, and the systems around them, especially
                      Victus and the content engine built to grow it.
                    </p>
                  </div>
                </div>

                <p className="intro-meta">{introMeta}</p>
              </section>

              <motion.button
                type="button"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={() => setSelectedProjectId(featuredProject.id)}
                className={`presentation-tile project-tile tile-victus tile-showcase text-left ${
                  isPraiseFeatured
                    ? "tile-showcase-praise"
                    : isComingSoonFeatured
                      ? "tile-showcase-coming"
                      : "tile-showcase-victus"
                }`}
              >
                {isVictusFeatured ? (
                  <div className="victus-card-content">
                    <div className="victus-icon-shell">
                      <Image
                        src="/projects/victus/icon.png"
                        alt="Victus icon"
                        width={92}
                        height={92}
                        className="victus-card-icon"
                      />
                    </div>

                    <div className="victus-card-copy">
                      <h2 className="project-title victus-card-title">Victus</h2>

                      <div className="victus-platform-row" aria-label="Platforms">
                        <span className="victus-platform-pill">iOS</span>
                        <span className="victus-platform-pill">Android</span>
                      </div>

                      <div className="victus-stat-row">
                        <div className="victus-rating-row" aria-label="App rating">
                          <Star className="victus-rating-star" />
                          <span className="victus-rating-value">4.9</span>
                          <span className="victus-rating-meta">950+ ratings</span>
                        </div>

                        <span className="victus-install-pill">7k+ installs</span>
                      </div>
                    </div>
                  </div>
                ) : isPraiseFeatured ? (
                  <div className="victus-card-content">
                    <div className="victus-icon-shell praise-showcase-icon-shell">
                      <Image
                        src="/projects/praiselock/icon-full-bleed.png"
                        alt="Praise Lock icon"
                        width={92}
                        height={92}
                        className="victus-card-icon"
                      />
                    </div>

                    <div className="victus-card-copy">
                      <h2 className="project-title victus-card-title">
                        Praise Lock
                      </h2>

                      <div className="victus-platform-row" aria-label="Platforms">
                        <span className="victus-platform-pill">iOS</span>
                        <span className="victus-platform-pill">Android</span>
                      </div>

                      <div className="victus-stat-row">
                        <div className="victus-rating-row" aria-label="App rating">
                          <Star className="victus-rating-star" />
                          <span className="victus-rating-value">4.8</span>
                          <span className="victus-rating-meta">40+ ratings</span>
                        </div>

                        <span className="victus-install-pill">500 installs</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="showcase-card showcase-card-coming">
                    <div className="showcase-copy">
                      <p className="presentation-kicker">Next app</p>
                      <h2 className="project-title showcase-title">Coming Soon</h2>
                      <p className="showcase-summary">
                        Reserved for the next shipped product in the stack.
                      </p>
                    </div>

                    <div className="showcase-placeholder">+</div>
                  </div>
                )}
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={() => setSelectedProjectId("engine")}
                className="presentation-tile project-tile tile-engine text-left"
              >
                <div className="tile-topline">
                  <p className="presentation-kicker">AI Content Engine</p>
                  <span className="status-pill">Technical project</span>
                </div>

                <h2 className="project-title project-title-sm">
                  Distribution systems for Victus.
                </h2>
                <p className="project-summary">
                  Generate, schedule, publish, and analyze from one internal
                  pipeline.
                </p>

                <div className="micro-list">
                  <span>Generate</span>
                  <span>Schedule</span>
                  <span>Publish</span>
                  <span>Analyze</span>
                </div>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={() => setSelectedProjectId("photocv")}
                className="presentation-tile project-tile tile-dock photocv-wide text-left"
                aria-label="Open PhotoCV.ai project details"
              >
                <div className="photocv-wide-layout">
                  <div className="photocv-brand-panel">
                    <Image
                      src="/projects/photocv/logo.png"
                      alt="PhotoCV.ai"
                      width={769}
                      height={324}
                      className="photocv-logo-image"
                    />
                  </div>

                  <div className="photocv-home-carousel" aria-hidden="true">
                    <div className="photocv-home-side photocv-home-side-before">
                      <div className="photocv-home-track photocv-home-track-before">
                        {photocvRailPairs.map((pair, index) => (
                        <div
                          key={`photocv-before-${pair.name}-${index}`}
                          className="photocv-home-card"
                        >
                          <Image
                            src={pair.before}
                            alt=""
                            fill
                            sizes="88px"
                            className="photocv-home-image photocv-home-image-before"
                          />
                        </div>
                      ))}
                    </div>
                    </div>

                    <div className="photocv-home-side photocv-home-side-after">
                      <div className="photocv-home-track photocv-home-track-after">
                        {photocvRailPairs.map((pair, index) => (
                          <div
                            key={`photocv-after-${pair.name}-${index}`}
                            className="photocv-home-card"
                          >
                          <Image
                            src={pair.after}
                            alt=""
                            fill
                            sizes="88px"
                            className="photocv-home-image"
                          />
                        </div>
                      ))}
                    </div>
                    </div>

                    <div className="photocv-home-divider">
                      <div className="photocv-divider-line" />
                      <div className="photocv-divider-orb">
                        <svg
                          className="photocv-divider-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M13 2L5 13h5l-1 9 8-11h-5l1-9Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={() => setSelectedProjectId("praise-lock")}
                className="presentation-tile project-tile tile-praise text-left"
              >
                <div className="tile-topline">
                  <p className="presentation-kicker">Praise Lock</p>
                  <span className="status-pill">Live</span>
                </div>

                <h2 className="project-title project-title-sm">
                  Prayer-first app blocking.
                </h2>

                <div className="praise-visual">
                  <div className="praise-logo-shell">
                    <Image
                      src="/projects/praiselock/icon-full-bleed.png"
                      alt="Praise Lock icon"
                      width={88}
                      height={88}
                      className="praise-logo-image"
                    />
                  </div>
                </div>
              </motion.button>

              <section
                className="presentation-tile tile-photocv dock-tile dock-compact"
                aria-label="Built apps dock"
              >
                <div className="dock-shell">
                  {dockItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setFeaturedProjectId(item.id)}
                      className={`dock-item ${item.glowClassName} ${
                        featuredProjectId === item.id ? "is-active" : ""
                      }`}
                      aria-label={item.name}
                      aria-pressed={featuredProjectId === item.id}
                    >
                      <span className="dock-icon">
                        {item.imageSrc ? (
                          <Image
                            src={item.imageSrc}
                            alt={item.name}
                            fill
                            sizes="(max-width: 1279px) 72px, 78px"
                            className="dock-icon-image"
                          />
                        ) : (
                          item.icon
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {selectedProject ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
          >
            <button
              type="button"
              aria-label="Close project sheet"
              onClick={() => setSelectedProjectId(null)}
              className="absolute inset-0 bg-black/72 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className={`modal-sheet relative w-full rounded-[32px] border border-white/8 bg-[#070708] p-6 text-left shadow-[0_40px_120px_rgba(0,0,0,0.55)] md:p-8 ${
                hasRichContent ? "max-w-5xl modal-sheet-rich" : "max-w-2xl"
              }`}
            >
              <button
                type="button"
                onClick={() => setSelectedProjectId(null)}
                className="modal-close"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="modal-header">
                <div className="space-y-4 pr-10">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="presentation-kicker">{selectedProject.label}</p>
                    <span className="status-pill">{selectedProject.status}</span>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
                      {selectedProject.title}
                    </h3>
                    <p className="text-base leading-7 text-foreground/88 md:text-lg md:leading-8">
                      {selectedProject.summary}
                    </p>
                  </div>
                </div>

                {selectedProject.iconSrc ? (
                  <div className="project-brand-card">
                    <Image
                      src={selectedProject.iconSrc}
                      alt={`${selectedProject.title} icon`}
                      width={88}
                      height={88}
                    />
                  </div>
                ) : null}
              </div>

              {selectedProject.metrics?.length ? (
                <div className="modal-metric-grid">
                  {selectedProject.metrics.map((metric) => (
                    <div key={`${metric.label}-${metric.value}`} className="metric-card">
                      <p className="metric-value">{metric.value}</p>
                      <p className="metric-label">{metric.label}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {selectedProject.gallery?.length ? (
                <div className="modal-gallery">
                  {selectedProject.gallery.map((item) => (
                    <div key={item.src} className="modal-gallery-item">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes="(max-width: 767px) 44vw, (max-width: 1279px) 28vw, 220px"
                        className="modal-gallery-image"
                      />
                    </div>
                  ))}
                </div>
              ) : null}

              {selectedProject.stack?.length ||
              selectedProject.publicSignals?.length ||
              selectedProject.considerations?.length ? (
                <div
                  className={`modal-section-grid ${
                    sectionPanelCount === 3 ? "modal-section-grid-triad" : ""
                  }`}
                >
                  {selectedProject.stack?.length ? (
                    <section className="project-panel">
                      <p className="project-panel-kicker">Stack</p>
                      <ul className="project-panel-list">
                        {selectedProject.stack.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  {selectedProject.publicSignals?.length ? (
                    <section className="project-panel">
                      <p className="project-panel-kicker">Public signals</p>
                      <ul className="project-panel-list">
                        {selectedProject.publicSignals.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  ) : null}

                  {selectedProject.considerations?.length ? (
                    <section className="project-panel">
                      <p className="project-panel-kicker">What I had to think about</p>
                      <ul className="project-panel-list">
                        {selectedProject.considerations.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </section>
                  ) : null}
                </div>
              ) : null}

              {selectedProject.workflow?.length ? (
                <section className="modal-section">
                  <div className="modal-section-head">
                    <p className="presentation-kicker">Product loop</p>
                    <h4>How Victus works</h4>
                  </div>

                  <div className="workflow-grid">
                    {selectedProject.workflow.map((step, index) => (
                      <div key={step.title} className="workflow-card">
                        <span className="workflow-step">{`0${index + 1}`}</span>
                        <h5>{step.title}</h5>
                        <p>{step.body}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {selectedProject.decisions?.length ? (
                <section className="modal-section">
                  <div className="modal-section-head">
                    <p className="presentation-kicker">Build notes</p>
                    <h4>Key decisions and blockers</h4>
                  </div>

                  <div className="decision-list">
                    {selectedProject.decisions.map((decision) => (
                      <article key={decision.title} className="decision-card">
                        <h5>{decision.title}</h5>
                        <p>
                          <span className="decision-label">Problem</span>
                          {decision.problem}
                        </p>
                        <p>
                          <span className="decision-label">Solution</span>
                          {decision.solution}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {!hasRichContent && selectedProject.details?.length ? (
                <div className="mt-7 grid gap-3">
                  {selectedProject.details.map((detail) => (
                    <div
                      key={detail}
                      className="rounded-[22px] border border-white/8 bg-white/[0.04] px-4 py-4 text-sm leading-7 text-muted-foreground"
                    >
                      {detail}
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="modal-link-row">
                {selectedProject.links?.length ? (
                  selectedProject.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className={
                        link.primary
                          ? "modal-link-primary"
                          : "modal-link-secondary"
                      }
                    >
                      {link.label}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ))
                ) : (
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-muted-foreground">
                    Public link not attached yet.
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
