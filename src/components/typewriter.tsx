"use client";

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  MapPin,
  Star,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import {
  siInstagram,
  siTiktok,
  siX,
  siYoutube,
} from "simple-icons";

type ViewId =
  | "about"
  | "victus"
  | "content-ops"
  | "praise-lock"
  | "photocv";

type ExternalLinkItem = {
  label: string;
  href: string;
  primary?: boolean;
};

type StackCardItem = {
  label: string;
  detail: string;
};

type FlowStepItem = {
  label: string;
  detail: string;
};

type VisualMetricItem = {
  value: string;
  label: string;
};

type ListSection = {
  kicker: string;
  title: string;
  items: string[];
  cards?: StackCardItem[];
  steps?: FlowStepItem[];
};

type VisualMode = "profile" | "app" | "brand" | "ops";

type BrandGlyph = {
  title: string;
  path: string;
  hex: string;
};

type ViewState = {
  id: ViewId;
  accent: string;
  accentSoft: string;
  dockDot: string;
  dock: {
    label: string;
    imageSrc?: string;
    textIcon?: string;
    iconClassName?: string;
  };
  visual: {
    kicker: string;
    title: string;
    subtitle?: string;
    location?: string;
    mode: VisualMode;
    imageSrc?: string;
    logoSrc?: string;
    textIcon?: string;
    iconClassName?: string;
    platforms?: string[];
    platformUrls?: Record<string, string>;
    ratingValue?: string;
    ratingLabel?: string;
    installs?: string;
    metrics?: VisualMetricItem[];
    tags?: string[];
    opsSteps?: string[];
  };
  overview: {
    kicker?: string;
    title: string;
    body: string[];
    highlights: string[];
    links?: ExternalLinkItem[];
    aside?: "victus" | "praise-lock" | "photocv" | "content-ops";
  };
  stack: ListSection;
  flow: ListSection;
  notes: ListSection;
};

const transition = { duration: 0.22, ease: "easeOut" } as const;

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

const aboutUsageSnapshot = {
  total: "30.9B+",
  last30: "21.8B",
} as const;

const aboutUsageTrend = [
  { month: "May", cumulative: 0 },
  { month: "Jun", cumulative: 277286568 },
  { month: "Jul", cumulative: 1213970146 },
  { month: "Aug", cumulative: 1276077379 },
  { month: "Sep", cumulative: 1543081436 },
  { month: "Oct", cumulative: 1548065964 },
  { month: "Nov", cumulative: 1549592483 },
  { month: "Dec", cumulative: 1749530909 },
  { month: "Jan", cumulative: 3963400865 },
  { month: "Feb", cumulative: 6731271332 },
  { month: "Mar", cumulative: 21300888908 },
  { month: "Apr", cumulative: 30957682820 },
] as const;

function buildUsageChart(
  series: readonly { month: string; cumulative: number }[],
  width: number,
  height: number,
) {
  const left = 0;
  const right = width;
  const top = Math.max(8, height * 0.03);
  const bottom = Math.max(top + 12, height - Math.max(12, height * 0.08));
  const max = Math.max(...series.map((point) => point.cumulative), 1);

  const points = series.map((point, index) => {
    const x = left + ((right - left) * index) / (series.length - 1);
    const normalized = point.cumulative / max;
    const eased = Math.pow(normalized, 0.74);
    const y = bottom - eased * (bottom - top);
    return {
      ...point,
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3)),
    };
  });

  const line = points
    .map((point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }

      const previous = points[index - 1];
      const controlX = Number(((previous.x + point.x) / 2).toFixed(3));
      return `C ${controlX} ${previous.y}, ${controlX} ${point.y}, ${point.x} ${point.y}`;
    })
    .join(" ");

  const area = `${line} L ${right} ${height} L ${left} ${height} Z`;

  return {
    points,
    line,
    area,
    last: points[points.length - 1],
  };
}

type AboutToolLogo = {
  label: string;
  src?: string;
  width: number;
  height: number;
  lane: "raised" | "lowered";
  kind?: "wordmark" | "lockup";
};

const aboutToolchain = [
  {
    label: "Codex",
    src: "/tool-logos/codex-logo.png",
    width: 98,
    height: 28,
    lane: "lowered",
    kind: "lockup",
  },
  {
    label: "Claude",
    src: "/tool-logos/claude.svg",
    width: 102,
    height: 24,
    lane: "raised",
    kind: "wordmark",
  },
  {
    label: "Cursor",
    src: "/tool-logos/cursor.svg",
    width: 104,
    height: 25,
    lane: "lowered",
    kind: "wordmark",
  },
  {
    label: "Antigravity",
    src: "/tool-logos/antigravity.png",
    width: 140,
    height: 24,
    lane: "raised",
    kind: "wordmark",
  },
  {
    label: "Modal",
    src: "/tool-logos/modal.png",
    width: 132,
    height: 25,
    lane: "lowered",
    kind: "wordmark",
  },
  {
    label: "Flutter",
    src: "/tool-logos/flutter.svg",
    width: 84,
    height: 26,
    lane: "raised",
    kind: "wordmark",
  },
  {
    label: "Next.js",
    src: "/tool-logos/nextjs.svg",
    width: 98,
    height: 23,
    lane: "lowered",
    kind: "wordmark",
  },
  {
    label: "Firebase",
    src: "/tool-logos/firebase.svg",
    width: 86,
    height: 25,
    lane: "raised",
    kind: "wordmark",
  },
  {
    label: "Supabase",
    src: "/tool-logos/supabase-dark.png",
    width: 114,
    height: 26,
    lane: "lowered",
    kind: "wordmark",
  },
  {
    label: "Cloudinary",
    src: "/tool-logos/cloudinary.png",
    width: 126,
    height: 24,
    lane: "raised",
    kind: "wordmark",
  },
  {
    label: "FFmpeg",
    src: "/tool-logos/ffmpeg.png",
    width: 106,
    height: 27,
    lane: "lowered",
    kind: "lockup",
  },
  {
    label: "Vercel",
    src: "/tool-logos/vercel.svg",
    width: 100,
    height: 22,
    lane: "raised",
    kind: "wordmark",
  },
  {
    label: "Xcode",
    src: "/tool-logos/xcode.jpeg",
    width: 102,
    height: 28,
    lane: "lowered",
    kind: "lockup",
  },
  {
    label: "RevenueCat",
    src: "/tool-logos/revenuecat.svg",
    width: 104,
    height: 25,
    lane: "raised",
    kind: "wordmark",
  },
  {
    label: "Superwall",
    src: "/tool-logos/superwall.png",
    width: 114,
    height: 32,
    lane: "lowered",
    kind: "wordmark",
  },
  {
    label: "OpenClaw",
    src: "/tool-logos/openclaw.png",
    width: 138,
    height: 34,
    lane: "raised",
    kind: "lockup",
  },
] as const satisfies readonly AboutToolLogo[];

const aboutOutsideWork = [
  {
    label: "X",
    href: "https://x.com/julianisdoing",
    icon: siX,
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@julianisdoing",
    icon: siTiktok,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/julianisdoing/",
    icon: siInstagram,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@JulianIsDoing",
    icon: siYoutube,
  },
] as const;

const views: ViewState[] = [
  {
    id: "about",
    accent: "#d7dde8",
    accentSoft: "rgb(215 221 232 / 0.14)",
    dockDot: "#d7dde8",
    dock: {
      label: "About",
      imageSrc: "/profile-assets/about-profile.jpg",
    },
    visual: {
      kicker: "About",
      title: "Julian Albou",
      subtitle: "AI-first software developer",
      location: "Cannes, FR / Los Angeles, USA",
      mode: "profile",
      imageSrc: "/profile-assets/about-profile.jpg",
    },
    overview: {
      title: "Developer first. Generalist by range.",
      body: [
        "I build mobile apps, monetized web products, and the internal systems around them. Currently focused on Victus, a gamified self-improvement app with an automated pipeline for video generation, posting, and analytics behind it.",
        "The way I build is AI-native. I treat agentic tools as the primary execution layer and spend my time on architecture, product decisions, and the tradeoffs that determine whether something ships.",
        "I came to this full-time a year ago, after several years at a high-growth startup across business development, sales, growth, product, and design. That range taught me how to operate with ambiguity, move fast with limited resources, and care about outcomes end to end.",
        "I'm French-American, born in Paris and raised in Los Angeles, and I think that shaped a lot of how I work. I'm naturally curious, drawn to fast-moving environments, and happiest around smart people building hard things.",
      ],
      highlights: [
        "Developer",
        "Mobile + web",
        "Automation systems",
        "Shipped products",
      ],
    },
    stack: {
      kicker: "AI usage",
      title: "Real volume, tracked locally.",
      items: [],
    },
    flow: {
      kicker: "Tools I like",
      title: "What I reach for most.",
      items: [],
    },
    notes: {
      kicker: "Socials",
      title: "Signal outside the editor.",
      items: [],
    },
  },
  {
    id: "victus",
    accent: "#d1ac35",
    accentSoft: "rgb(209 172 53 / 0.14)",
    dockDot: "#d1ac35",
    dock: {
      label: "Victus",
      imageSrc: "/projects/victus/icon.png",
    },
    visual: {
      kicker: "Flagship app",
      title: "Victus",
      mode: "app",
      imageSrc: "/projects/victus/icon.png",
      platforms: ["iOS", "Android"],
      platformUrls: {
        iOS: "https://apps.apple.com/us/app/victus-discipline-habits/id6754204999",
        Android: "https://play.google.com/store/apps/details?id=com.victus.app",
      },
      tags: ["B2C", "Health & Fitness"],
      ratingValue: "4.9",
      ratingLabel: "950+ ratings",
      installs: "7k+ installs",
    },
    overview: {
      kicker: "Overview",
      title: "Gamified self-improvement and habit tracker",
      body: [
        "Victus turns onboarding inputs into a personalized 66-day journey, then uses daily missions, XP, streaks, achievements, and leaderboards to make execution feel alive instead of static.",
        "The hard part is keeping the system coherent underneath the surface: onboarding logic, schedule truth, monetization, retention, and offline-safe progression all have to keep working while the product keeps shipping.",
      ],
      highlights: [
        "66-day journey plans",
        "Daily XP + streaks",
        "Leaderboards + achievements",
        "Live monetization",
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
      aside: "victus",
    },
    stack: {
      kicker: "Stack",
      title: "What powers the product.",
      items: [
        "Flutter / Dart mobile client shipping across iOS and Android.",
        "Firebase auth, Firestore, functions, messaging, analytics, and crash reporting.",
        "RevenueCat plus Superwall for subscriptions, paywalls, and monetization experiments.",
        "Local cache and sync logic so completions feel instant without corrupting progression.",
      ],
      cards: [
        {
          label: "Flutter",
          detail:
            "Victus ships from a single Flutter and Dart codebase across iOS and Android, which keeps onboarding, missions, and progression surfaces aligned while the product moves quickly.",
        },
        {
          label: "Firebase",
          detail:
            "Firebase handles auth, Firestore data, functions, messaging, analytics, and crash reporting, so the backend stays cohesive instead of getting split across disconnected services.",
        },
        {
          label: "RevenueCat + Superwall",
          detail:
            "RevenueCat runs subscriptions while Superwall controls paywalls and experiments, which makes monetization easier to iterate without slowing core product development.",
        },
        {
          label: "Offline Sync",
          detail:
            "Local cache and reconciliation logic make completions feel instant even offline, then safely sync XP, streaks, and progression back into the shared source of truth.",
        },
      ],
    },
    flow: {
      kicker: "How it works",
      title: "Core loop.",
      items: [
        "Onboarding captures source, habits, pillars, obstacles, and preferences.",
        "Victus generates a structured journey plan and daily mission set from that input.",
        "Completions update XP, streaks, ranks, achievements, and retention surfaces together.",
      ],
      steps: [
        {
          label: "Onboard",
          detail: "Capture source, habits, pillars, obstacles, and preferences.",
        },
        {
          label: "Generate",
          detail: "Build a 66-day journey and daily mission set from that input.",
        },
        {
          label: "Reinforce",
          detail: "Update XP, streaks, ranks, achievements, and retention together.",
        },
      ],
    },
    notes: {
      kicker: "What mattered",
      title: "Key product constraints.",
      items: [
        "Frozen 66-day JourneyPlan keeps schedules, edits, and streaks from drifting.",
        "Local cache stays authoritative for completions, XP, ranks, and achievements before Firestore sync.",
        "Web checkout, RevenueCat, and Superwall unlock paid users without losing journey state.",
      ],
    },
  },
  {
    id: "content-ops",
    accent: "#8e8cff",
    accentSoft: "rgb(142 140 255 / 0.15)",
    dockDot: "#8e8cff",
    dock: {
      label: "Victus Content Ops",
      imageSrc: "/projects/content-ops/icon.png?v=20260419-purple-final",
      iconClassName: "dock-icon-ops",
    },
    visual: {
      kicker: "Internal system",
      title: "Victus Content Ops",
      mode: "app",
      imageSrc: "/projects/content-ops/icon.png?v=20260419-purple-final",
      iconClassName: "visual-icon-ops",
      platforms: ["Internal"],
      opsSteps: ["Generate", "Render", "Schedule", "Analyze"],
      tags: ["Agentic Ops", "Content Delivery"],
      metrics: [
        {
          value: "1K+",
          label: "generated videos",
        },
        {
          value: "3M+",
          label: "views",
        },
      ],
    },
    overview: {
      kicker: "Overview",
      title: "Internal engine for generating, scheduling, and learning from content",
      body: [
        "I built the Victus content ops system so organic content could scale rapidly. The goal was leverage: more output, tighter iteration, less drag.",
        "It turns ideas into generated videos, routes them through scheduling providers, and closes the loop with analytics so distribution behaves like an operating system rather than a checklist.",
      ],
      highlights: [
        "AI generation",
        "Scheduler integrations",
        "Analytics feedback loop",
        "Multi-account operations",
      ],
      links: [
        {
          label: "Open Victus",
          href: "https://www.getvictus.com",
          primary: true,
        },
      ],
      aside: "content-ops",
    },
    stack: {
      kicker: "Stack",
      title: "Operating pieces.",
      items: [
        "FFmpeg rendering for low-cost, repeatable video assembly.",
        "Modal workers for burst generation when thousands of videos need to be rendered quickly.",
        "Firestore-backed state for generated, scheduled, posted, and failed videos.",
        "Custom agent skills for generation, variations, translation, sequencing, and analytics workflows.",
      ],
      cards: [
        {
          label: "FFmpeg",
          detail:
            "Switching the render pipeline from CreativeMate to FFmpeg made video assembly repeatable and brought generation costs down dramatically, roughly 50x compared with the earlier approach.",
        },
        {
          label: "Modal",
          detail:
            "Modal let the system rent compute only when needed and fan out many FFmpeg workers at once, so large batches could be generated quickly without keeping expensive infrastructure running all the time.",
        },
        {
          label: "Firestore",
          detail:
            "Firestore and scheduling-server records kept the pipeline accountable across generated, scheduled, posted, and failed videos, which mattered once dozens of accounts were moving at the same time.",
        },
        {
          label: "Agent Skills",
          detail:
            "Custom agent skills packaged the repeatable work: generate variants, apply translations, sequence posts by region and account, work around rate limits, and pull analytics back without turning the workflow into manual ops.",
        },
      ],
    },
    flow: {
      kicker: "How it works",
      title: "Distribution loop.",
      items: [
        "Generate assets and variations using custom agent skills.",
        "Prepare and publish months worth of content across accounts.",
        "Analyze performance and feed the learning back into the system.",
      ],
      steps: [
        {
          label: "Render",
          detail: "Generate assets and variations using custom agent skills.",
        },
        {
          label: "Schedule",
          detail: "Prepare and publish months worth of content across accounts.",
        },
        {
          label: "Analyze + learn",
          detail: "Pull performance data back into the system for iteration.",
        },
      ],
    },
    notes: {
      kicker: "What mattered",
      title: "System constraints.",
      items: [
        "Moved rendering from CreativeMate to FFmpeg, cutting video generation costs by roughly 50x.",
        "Scaled repeatable generation and scheduling across dozens of accounts posting up to 25 times per day.",
        "Used Modal workers, database state, and analytics to track generated, scheduled, posted, and failed videos.",
      ],
    },
  },
  {
    id: "praise-lock",
    accent: "#6ea9ff",
    accentSoft: "rgb(110 169 255 / 0.14)",
    dockDot: "#6ea9ff",
    dock: {
      label: "Praise Lock",
      imageSrc: "/projects/praiselock/icon-full-bleed.png",
    },
    visual: {
      kicker: "Prayer-first app",
      title: "Praise Lock",
      mode: "app",
      imageSrc: "/projects/praiselock/icon-full-bleed.png",
      platforms: ["iOS"],
      platformUrls: {
        iOS: "https://apps.apple.com/us/app/praise-lock-stop-focus-pray/id6759266143",
      },
      tags: ["B2C", "Reference"],
      ratingValue: "4.8",
      ratingLabel: "40+ ratings",
      installs: "500 installs",
    },
    overview: {
      kicker: "Overview",
      title: "Prayer-first blocker that turns distraction into ritual",
      body: [
        "Praise Lock blocks distracting apps, reroutes the moment into a guided prayer flow, and hands the user back with more intention instead of another mindless doomscroll.",
        "Behind the simple prayer loop is a fairly complex system: native app blocking and permissions, AI-generated prayers, streaks, local reminders, subscriptions, and analytics all working together without making the experience feel transactional.",
      ],
      highlights: [
        "App lock integrations",
        "Generated prayer flow",
        "iOS + Android",
        "Live subscriptions",
      ],
      links: [
        {
          label: "Visit praiselock.com",
          href: "https://www.praiselock.com",
          primary: true,
        },
      ],
      aside: "praise-lock",
    },
    stack: {
      kicker: "Stack",
      title: "What powers it.",
      items: [
        "Flutter, Riverpod, and go_router for the onboarding, gate, prayer, paywall, and settings flows.",
        "iOS Screen Time APIs: FamilyControls, ManagedSettings, DeviceActivity, and Shield extensions.",
        "Prayer API plus Sqflite history so generated prayers can respond to mood, faith state, and recent verses.",
        "RevenueCat, Superwall, Mixpanel, Firebase, Singular, and Smartlook around subscriptions and behavior.",
      ],
      cards: [
        {
          label: "Flutter",
          detail:
            "Flutter, Riverpod, and go_router hold the core product together: onboarding, lock setup, blocked-app gate, prayer, paywall, settings, and native app-lock events all route through one app state model.",
        },
        {
          label: "Screen Time APIs",
          detail:
            "The iOS blocking layer uses FamilyControls, ManagedSettings, DeviceActivity, and Shield extensions, with shared App Group state to keep selected apps, shield actions, notifications, and emergency unlocks in sync.",
        },
        {
          label: "Prayer Engine",
          detail:
            "The prayer API takes mood, relationship-with-God input, and recent prayer history, then avoids repeating recent verses and books. Sqflite stores the prayer history so streaks and personalization can rebuild locally.",
        },
        {
          label: "RevenueCat + Superwall",
          detail:
            "RevenueCat and Superwall handle subscription access and paywall experiments, while Mixpanel, Firebase, Singular, and Smartlook keep onboarding, purchase, retention, and diagnostic signals visible.",
        },
      ],
    },
    flow: {
      kicker: "How it works",
      title: "Core loop.",
      items: [
        "Users choose which apps, categories, and sites should be gated.",
        "Blocked app launches and notification taps route into the prayer experience.",
        "Prayer generation, streaks, and journey state turn the interruption into a repeatable habit loop.",
      ],
      steps: [
        {
          label: "Gate",
          detail: "Choose which apps, categories, and sites should be blocked.",
        },
        {
          label: "Intercept",
          detail: "Route launches and notification taps into prayer.",
        },
        {
          label: "Reset",
          detail: "Turn the interruption into prayer, streaks, and journey state.",
        },
      ],
    },
    notes: {
      kicker: "What mattered",
      title: "Key build decisions.",
      items: [
        "Turned iOS Screen Time constraints into a clean prayer loop instead of a confusing permission wall.",
        "Kept shield actions, deep links, and emergency unlocks reliable across native extensions and Flutter.",
        "Balanced AI prayers, streaks, notifications, and paywalls without making prayer feel transactional.",
      ],
    },
  },
  {
    id: "photocv",
    accent: "#5ee6a8",
    accentSoft: "rgb(94 230 168 / 0.14)",
    dockDot: "#5ee6a8",
    dock: {
      label: "PhotoCV.ai",
      imageSrc: "/projects/photocv/favicon.png",
    },
    visual: {
      kicker: "Live web product",
      title: "PhotoCV.ai",
      mode: "app",
      imageSrc: "/projects/photocv/favicon.png",
      platforms: ["Web"],
      platformUrls: {
        Web: "https://www.photocv.ai",
      },
      tags: ["B2C", "AI Image Gen"],
      metrics: [
        {
          value: "1K+",
          label: "AI headshots generated",
        },
        {
          value: "650+",
          label: "users",
        },
      ],
    },
    overview: {
      kicker: "Overview",
      title: "Live AI image generation behind a consumer flow",
      body: [
        "PhotoCV.ai turns a batch of selfies into a gallery of professional headshots. Upload, choose styles, check out, wait, download — the user never sees the pipeline underneath.",
        "Underneath is a real generation system with cost, quality, and reliability pulling in different directions, and a funnel where acquisition, checkout, and delivery all have to stay coherent as the product keeps shipping.",
      ],
      highlights: [
        "Live revenue",
        "France-first SEO",
        "Stripe + delivery automation",
        "Before/after gallery",
      ],
      links: [
        {
          label: "Visit PhotoCV.ai",
          href: "https://www.photocv.ai",
          primary: true,
        },
      ],
      aside: "photocv",
    },
    stack: {
      kicker: "Stack",
      title: "What powers the funnel.",
      items: [
        "Next.js, TypeScript, Tailwind, and next-intl for the product flow plus localized acquisition pages.",
        "Supabase for auth, PostgreSQL order state, selfie uploads, generated results, and gated delivery.",
        "Stripe plus Datafast/GA attribution connecting SEO visits, free previews, checkout, and paid revenue signals.",
        "Fal.ai Nano Banana 2 generation pipeline with preview promotion, job reconciliation, and stored final galleries.",
      ],
      cards: [
        {
          label: "Next.js",
          detail:
            "Next.js, TypeScript, Tailwind, and next-intl power the paid product flow and the localized SEO/city pages, so acquisition and conversion live in the same system.",
        },
        {
          label: "Supabase",
          detail:
            "Supabase handles auth, PostgreSQL order state, selfie uploads, generated results, and gated delivery, keeping the whole customer journey grounded in one backend.",
        },
        {
          label: "Stripe + Datafast",
          detail:
            "Stripe checkout, webhooks, Datafast, and GA metadata keep the SEO-to-preview-to-payment funnel measurable through paid delivery.",
        },
        {
          label: "Fal Pipeline",
          detail:
            "Fal.ai Nano Banana 2 powers the current generation path, replacing the more expensive LoRA-training approach and making cheap free previews viable.",
        },
      ],
    },
    flow: {
      kicker: "How it works",
      title: "Customer journey.",
      items: [
        "Acquire through localized SEO pages and high-intent resume-photo searches.",
        "Collect 8 to 20 selfies plus style selections before generation starts.",
        "Move from payment into processing cleanly and deliver a usable final gallery.",
      ],
      steps: [
        {
          label: "Acquire",
          detail: "Bring visitors through localized SEO pages and high-intent searches.",
        },
        {
          label: "Collect",
          detail: "Gather selfies, style choices, checkout, and order state.",
        },
        {
          label: "Deliver",
          detail: "Generate, process, and hand back a usable final gallery.",
        },
      ],
    },
    notes: {
      kicker: "What mattered",
      title: "Product constraints.",
      items: [
        "Rebuilt the backend and generation pipeline around reliable orders, uploads, previews, and paid delivery.",
        "Moved from expensive LoRA training to Fal.ai Nano Banana 2, cutting generation costs by roughly 20x.",
        "Made localized SEO the acquisition engine feeding directly into preview, checkout, and fulfillment.",
      ],
    },
  },
];

const viewMap = Object.fromEntries(
  views.map((view) => [view.id, view])
) as Record<ViewId, ViewState>;

function isViewId(value: string | null): value is ViewId {
  return value !== null && value in viewMap;
}

function isProjectView(view: ViewState) {
  return view.id !== "about";
}

function getViewHref(id: ViewId) {
  return `/?view=${id}`;
}

function TileSwap({
  swapKey,
  className,
  children,
}: {
  swapKey: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={swapKey}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={transition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function AboutIdentityPanel({ view }: { view: ViewState }) {
  if (!view.visual.imageSrc) {
    return null;
  }

  return (
    <div className="visual-profile-card about-identity-card">
      <div className="visual-profile-photo-shell about-identity-photo-shell">
        <Image
          src={view.visual.imageSrc}
          alt="Julian Albou"
          fill
          sizes="(max-width: 1279px) 100vw, 300px"
          priority
          className="visual-profile-photo"
        />
      </div>

      <div className="visual-copy about-identity-copy">
        <div className="visual-heading">
          <h2 className="visual-title">{view.visual.title}</h2>
          {view.visual.subtitle ? (
            <p className="visual-subtitle about-identity-role">
              {view.visual.subtitle}
            </p>
          ) : null}
          {view.id === "about" ? (
            <p className="about-identity-emoji-row" aria-label="Personal signals">
              🇺🇸 🇫🇷 🏍️ 🏂 ✈️ 🎾 🧗‍♂️ 👨‍💻
            </p>
          ) : null}
        </div>

        {view.visual.location ? (
          <div className="about-identity-location">
            <MapPin className="about-identity-location-icon" />
            <span>{view.visual.location}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function BrandMark({
  icon,
  label,
}: {
  icon: BrandGlyph;
  label: string;
}) {
  const normalized = icon.hex.toLowerCase();
  const color =
    normalized === "000000" || normalized === "171717" || normalized === "181717"
      ? "#f5f5f7"
      : `#${icon.hex}`;

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="brand-mark"
      style={{ color }}
    >
      <title>{label}</title>
      <path d={icon.path} fill="currentColor" />
    </svg>
  );
}

function ViewVisual({ view }: { view: ViewState }) {
  if (view.id === "about") {
    return <AboutIdentityPanel view={view} />;
  }

  if (view.visual.mode === "profile" && view.visual.imageSrc) {
    return (
      <div className="visual-profile-card">
        <div className="visual-profile-photo-shell">
          <Image
            src={view.visual.imageSrc}
            alt="Julian Albou"
            fill
            sizes="(max-width: 1279px) 100vw, 320px"
            priority
            className="visual-profile-photo"
          />
        </div>

        <div className="visual-copy">
          <div className="visual-heading">
            <p className="presentation-kicker">{view.visual.kicker}</p>
            <h2 className="visual-title">{view.visual.title}</h2>
            {view.visual.subtitle ? (
              <p className="visual-subtitle">{view.visual.subtitle}</p>
            ) : null}
          </div>

          {view.visual.tags?.length ? (
            <div className="badge-row">
              {view.visual.tags.map((tag) => (
                <span key={tag} className="badge-pill">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (
    view.visual.mode === "app" &&
    (view.visual.imageSrc || view.visual.textIcon)
  ) {
    return (
      <div className="visual-app-card">
        <div className={`visual-icon-shell ${view.visual.iconClassName ?? ""}`}>
          {view.visual.imageSrc ? (
            <Image
              src={view.visual.imageSrc}
              alt={`${view.visual.title} icon`}
              width={120}
              height={120}
              className="visual-app-icon"
            />
          ) : view.visual.textIcon ? (
            <span className="visual-icon-text">{view.visual.textIcon}</span>
          ) : null}
        </div>

        <div className="visual-copy visual-copy-centered">
          <h2 className="visual-title">{view.visual.title}</h2>
          {view.visual.subtitle ? (
            <p className="visual-subtitle">{view.visual.subtitle}</p>
          ) : null}

          {view.visual.platforms?.length ? (
            <div className="platform-row" aria-label="Live platform links">
              {view.visual.platforms.map((platform) => {
                const href = view.visual.platformUrls?.[platform];

                return href ? (
                  <a
                    key={platform}
                    className="platform-link"
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>{platform}</span>
                    <ArrowUpRight className="platform-link-icon" />
                  </a>
                ) : (
                  <span key={platform} className="platform-text">
                    {platform}
                  </span>
                );
              })}
            </div>
          ) : null}

          {view.visual.tags?.length ? (
            <p className="visual-tag-line">{view.visual.tags.join(" | ")}</p>
          ) : null}

          <div className="stat-row">
            {view.visual.ratingValue && view.visual.ratingLabel ? (
              <div className="rating-row" aria-label="App rating">
                <Star className="rating-star" />
                <span className="rating-value">{view.visual.ratingValue}</span>
                <span className="rating-label">{view.visual.ratingLabel}</span>
              </div>
            ) : null}

            {view.visual.installs ? (
              <span className="install-pill">{view.visual.installs}</span>
            ) : null}

            {view.visual.metrics?.map((metric, index) => (
              <span
                key={metric.label}
                className={
                  index === 0 ? "visual-metric-pill" : "install-pill"
                }
              >
                {index === 0 ? (
                  <>
                    <strong>{metric.value}</strong>
                    <span>{metric.label}</span>
                  </>
                ) : (
                  `${metric.value} ${metric.label}`
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (view.visual.mode === "brand" && view.visual.logoSrc) {
    return (
      <div className="visual-brand-card">
        <p className="presentation-kicker">{view.visual.kicker}</p>

        <div className="visual-brand-logo-shell">
          <Image
            src={view.visual.logoSrc}
            alt={view.visual.title}
            width={769}
            height={324}
            className="visual-brand-logo"
          />
        </div>

        <div className="visual-copy">
          <h2 className="visual-title">{view.visual.title}</h2>
          {view.visual.subtitle ? (
            <p className="visual-subtitle">{view.visual.subtitle}</p>
          ) : null}

          {view.visual.tags?.length ? (
            <div className="badge-row">
              {view.visual.tags.map((tag) => (
                <span key={tag} className="badge-pill">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="visual-ops-card">
      <div className="visual-heading">
        <p className="presentation-kicker">{view.visual.kicker}</p>
        <h2 className="visual-title">{view.visual.title}</h2>
        {view.visual.subtitle ? (
          <p className="visual-subtitle">{view.visual.subtitle}</p>
        ) : null}
      </div>

      <div className="ops-grid" aria-hidden="true">
        {view.visual.opsSteps?.map((step) => (
          <span key={step} className="ops-node">
            {step}
          </span>
        ))}
      </div>

      {view.visual.tags?.length ? (
        <div className="badge-row">
          {view.visual.tags.map((tag) => (
            <span key={tag} className="badge-pill">
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function OverviewAside({ view }: { view: ViewState }) {
  if (view.overview.aside === "victus") {
    return (
      <div className="overview-aside overview-aside-victus" aria-hidden="true">
        <div className="overview-victus-wordmark-shell">
          <Image
            src="/projects/victus/wordmark.png"
            alt=""
            width={716}
            height={330}
            className="overview-victus-wordmark"
          />
        </div>

        <div className="overview-victus-video-shell">
          <div className="overview-victus-demo-frame">
            <video
              className="overview-victus-demo-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/projects/victus/overview-demo-poster.webp?v=20260418c"
            >
              <source
                src="/projects/victus/overview-demo.mp4?v=20260418c"
                type="video/mp4"
              />
              <source
                src="/projects/victus/overview-demo.webm?v=20260418c"
                type="video/webm"
              />
            </video>
          </div>
        </div>
      </div>
    );
  }

  if (view.overview.aside === "praise-lock") {
    return (
      <div className="overview-aside overview-aside-praise" aria-hidden="true">
        <div className="overview-praise-wordmark-shell">
          <Image
            src="/projects/praiselock/wordmark.png"
            alt=""
            width={2092}
            height={732}
            className="overview-praise-wordmark"
          />
        </div>

        <div className="overview-praise-video-shell">
          <div className="overview-praise-demo-frame">
            <video
              className="overview-praise-demo-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/projects/praiselock/overview-demo-poster.webp?v=20260418c"
            >
              <source
                src="/projects/praiselock/overview-demo.mp4?v=20260418c"
                type="video/mp4"
              />
              <source
                src="/projects/praiselock/overview-demo.webm?v=20260418c"
                type="video/webm"
              />
            </video>
          </div>
        </div>
      </div>
    );
  }

  if (view.overview.aside === "content-ops") {
    return (
      <div className="overview-aside overview-aside-ops" aria-hidden="true">
        <div className="overview-ops-video-shell">
          <div className="overview-ops-demo-frame">
            <video
              className="overview-ops-demo-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/projects/content-ops/overview-demo-poster.webp?v=20260419a"
            >
              <source
                src="/projects/content-ops/overview-demo.webm?v=20260419a"
                type="video/webm"
              />
              <source
                src="/projects/content-ops/overview-demo.mp4?v=20260419a"
                type="video/mp4"
              />
            </video>
          </div>
        </div>
      </div>
    );
  }

  if (view.overview.aside === "photocv") {
    return (
      <div className="overview-aside overview-aside-photocv" aria-hidden="true">
        <div className="overview-photocv-wordmark-shell">
          <Image
            src="/projects/photocv/logo.png"
            alt=""
            width={769}
            height={324}
            className="overview-photocv-wordmark"
          />
        </div>

        <div className="overview-photocv-video-shell">
          <div className="overview-photocv-demo-frame">
            <video
              className="overview-photocv-demo-video"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster="/projects/photocv/overview-demo-poster.webp?v=20260418a"
            >
              <source
                src="/projects/photocv/overview-demo.webm?v=20260418a"
                type="video/webm"
              />
              <source
                src="/projects/photocv/overview-demo.mp4?v=20260418a"
                type="video/mp4"
              />
            </video>
          </div>
        </div>

        <div className="photocv-home-carousel">
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
    );
  }

  return null;
}

function OverviewFlowPanel({ section }: { section: ListSection }) {
  const steps =
    section.steps ??
    section.items.map((item, index) => ({
      label: `Step ${index + 1}`,
      detail: item,
    }));

  return (
    <div className="overview-flow-panel">
      <div className="overview-flow-steps">
        {steps.slice(0, 3).map((step, index) => (
          <div key={step.label} className="overview-flow-step">
            <span className="overview-flow-index">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="overview-flow-label">{step.label}</span>
            <span className="overview-flow-detail">{step.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectDemoTile({ view }: { view: ViewState }) {
  return (
    <TileSwap swapKey={`demo-${view.id}`} className="demo-tile-swap">
      <div
        className="project-demo-tile"
        role="img"
        aria-label={`${view.dock.label} product demo`}
      >
        <OverviewAside view={view} />
      </div>
    </TileSwap>
  );
}

function OverviewTile({ view }: { view: ViewState }) {
  if (view.id === "about") {
    return (
      <TileSwap swapKey={`overview-${view.id}`} className="overview-swap">
        <div className="overview-layout about-overview-layout">
          <div className="overview-copy about-overview-copy">
            <p className="presentation-kicker">{view.overview.kicker}</p>
            <h1 className="overview-title about-overview-title">
              {view.overview.title}
            </h1>

            <div className="overview-body about-overview-body">
              {view.overview.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </TileSwap>
    );
  }

  return (
    <TileSwap swapKey={`overview-${view.id}`} className="overview-swap">
      <div className="overview-layout">
        <div className="overview-copy overview-copy-with-flow">
          <h1 className="overview-title">{view.overview.title}</h1>

          <div className="overview-body">
            {view.overview.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <OverviewFlowPanel section={view.flow} />
        </div>
      </div>
    </TileSwap>
  );
}

function AboutUsagePanel({ compact = false }: { compact?: boolean }) {
  const chartId = useId().replace(/:/g, "");
  const chartRegionRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState({
    width: 360,
    height: compact ? 360 : 172,
  });

  useEffect(() => {
    const node = chartRegionRef.current;

    if (!node) {
      return;
    }

    const updateChartSize = () => {
      const rect = node.getBoundingClientRect();
      setChartSize({
        width: Math.max(Math.round(rect.width), 220),
        height: Math.max(Math.round(rect.height), compact ? 220 : 120),
      });
    };

    updateChartSize();

    const observer = new ResizeObserver(() => {
      updateChartSize();
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, [compact]);

  const usageChart = buildUsageChart(
    aboutUsageTrend,
    chartSize.width,
    chartSize.height,
  );
  const dotOuterSize = Math.max(26, Math.min(chartSize.width, chartSize.height) * 0.1);
  const dotInnerSize = dotOuterSize * 0.54;
  const strokeWidth = Math.max(2.2, chartSize.height * 0.0135);

  return (
    <section
      className={`about-usage-panel${compact ? " is-compact" : ""}`}
      aria-label="Usage snapshot"
    >
      <div className="about-usage-body-grid">
        <div className="about-usage-total-column">
          <div className="about-usage-total-block">
            <span className="about-usage-total">{aboutUsageSnapshot.total}</span>
            <span className="about-usage-total-caption">
              tokens used in the past 12 months
            </span>
          </div>
        </div>

        <div className="about-usage-live-card">
          <div className="about-usage-live-head">
            <span className="about-usage-live-dot" aria-hidden="true" />
            <span className="about-usage-live-label">Last 30d</span>
          </div>

          <strong className="about-usage-live-value">
            {aboutUsageSnapshot.last30}
          </strong>
        </div>
      </div>

      <div className="about-usage-chart-shell" aria-hidden="true">
        <div className="about-usage-chart-region" ref={chartRegionRef}>
          <svg
            className="about-usage-chart"
            viewBox={`0 0 ${chartSize.width} ${chartSize.height}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient
                id={`about-usage-area-gradient-${chartId}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor="rgb(44 225 123 / 0.32)" />
                <stop offset="78%" stopColor="rgb(44 225 123 / 0.06)" />
                <stop offset="100%" stopColor="rgb(44 225 123 / 0)" />
              </linearGradient>
              <linearGradient
                id={`about-usage-line-gradient-${chartId}`}
                x1="0"
                y1="0"
                x2="1"
                y2="0"
              >
                <stop offset="0%" stopColor="rgb(245 245 247 / 0.22)" />
                <stop offset="72%" stopColor="rgb(190 255 221 / 0.84)" />
                <stop offset="100%" stopColor="rgb(44 225 123 / 1)" />
              </linearGradient>
            </defs>

            <path
              d={usageChart.area}
              fill={`url(#about-usage-area-gradient-${chartId})`}
            />
            <path
              d={usageChart.line}
              fill="none"
              stroke={`url(#about-usage-line-gradient-${chartId})`}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span
            className="about-usage-chart-dot about-usage-chart-dot-outer"
            style={
              {
                left: `${usageChart.last.x}px`,
                top: `${usageChart.last.y}px`,
                width: `${dotOuterSize}px`,
                height: `${dotOuterSize}px`,
              } as CSSProperties
            }
          />
          <span
            className="about-usage-chart-dot about-usage-chart-dot-inner"
            style={
              {
                left: `${usageChart.last.x}px`,
                top: `${usageChart.last.y}px`,
                width: `${dotInnerSize}px`,
                height: `${dotInnerSize}px`,
              } as CSSProperties
            }
          />
        </div>

        <div className="about-usage-chart-labels">
          <span>{aboutUsageTrend[0].month}</span>
          <span>{aboutUsageTrend[aboutUsageTrend.length - 1].month}</span>
        </div>
      </div>
    </section>
  );
}

function ListTile({
  view,
  tileKey,
  section,
}: {
  view: ViewState;
  tileKey: string;
  section: ListSection;
}) {
  if (view.id === "about" && tileKey === "stack") {
    return (
      <TileSwap swapKey={`${tileKey}-${view.id}`} className="list-tile-swap">
        <div className="list-tile-body about-usage-tile">
          <div className="list-tile-head">
            <p className="presentation-kicker">{section.kicker}</p>
          </div>

          <AboutUsagePanel compact />
        </div>
      </TileSwap>
    );
  }

  if (view.id === "about" && tileKey === "flow") {
    const renderToolSequence = (sequenceKey: string) =>
      aboutToolchain.map((tool, index) => (
        <div
          key={`${sequenceKey}-${tool.label}-${index}`}
          className={`about-tool-item is-${tool.lane} about-tool-item-${tool.label
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}`}
          style={
            {
              "--tool-width": `${tool.width}px`,
              "--tool-height": `${tool.height}px`,
            } as CSSProperties
          }
        >
          {tool.kind === "lockup" ? (
            <div
              className={`about-tool-lockup about-tool-lockup-${tool.label
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")}`}
            >
              {tool.src ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tool.src}
                    alt=""
                    className="about-tool-lockup-icon"
                    draggable="false"
                  />
                </>
              ) : null}
              <span className="about-tool-lockup-text">{tool.label}</span>
            </div>
          ) : tool.src ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={tool.src}
                alt={`${tool.label} wordmark`}
                className="about-tool-logo"
                draggable="false"
              />
            </>
          ) : null}
        </div>
      ));

    return (
      <TileSwap swapKey={`${tileKey}-${view.id}`} className="list-tile-swap">
        <div className="list-tile-body about-toolchain-tile">
          <div className="list-tile-head">
            <p className="presentation-kicker">{section.kicker}</p>
          </div>

          <div className="about-tool-marquee" aria-label="Tools I like">
            <div className="about-tool-track" aria-hidden="true">
              <div className="about-tool-sequence">
                {renderToolSequence("primary")}
              </div>
              <div className="about-tool-sequence">
                {renderToolSequence("secondary")}
              </div>
            </div>
          </div>
        </div>
      </TileSwap>
    );
  }

  if (view.id === "about" && tileKey === "notes") {
    return (
      <TileSwap swapKey={`${tileKey}-${view.id}`} className="list-tile-swap">
        <div className="list-tile-body about-outside-tile">
          <div className="list-tile-head">
            <p className="presentation-kicker">{section.kicker}</p>
          </div>

          <div className="about-outside-row">
            {aboutOutsideWork.map((item) => {
              const iconNode = <BrandMark icon={item.icon} label={item.label} />;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="about-outside-pill is-link"
                >
                  <span className="about-outside-pill-icon">{iconNode}</span>
                  <span>{item.label}</span>
                  <ArrowUpRight className="about-outside-arrow" />
                </Link>
              );
            })}
          </div>
        </div>
      </TileSwap>
    );
  }

  if (tileKey === "stack" && section.cards?.length) {
    return (
      <TileSwap swapKey={`${tileKey}-${view.id}`} className="list-tile-swap">
        <ProjectStackTile view={view} section={section} />
      </TileSwap>
    );
  }

  if (tileKey === "notes") {
    return (
      <TileSwap swapKey={`${tileKey}-${view.id}`} className="list-tile-swap">
        <div className="list-tile-body notes-tile-body">
          <div className="list-tile-head">
            <p className="presentation-kicker">{section.kicker}</p>
          </div>

          <ol className="notes-constraint-list">
            {section.items.map((item, index) => (
              <li key={item} className="notes-constraint-item">
                <span className="notes-constraint-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="notes-constraint-copy">{item}</span>
              </li>
            ))}
          </ol>
        </div>
      </TileSwap>
    );
  }

  return (
    <TileSwap swapKey={`${tileKey}-${view.id}`} className="list-tile-swap">
      <div className="list-tile-body">
        <div className="list-tile-head">
          <p className="presentation-kicker">{section.kicker}</p>
          <h3 className="list-tile-title">{section.title}</h3>
        </div>

        <ul className="list-tile-list">
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </TileSwap>
  );
}

function ProjectStackTile({
  view,
  section,
}: {
  view: ViewState;
  section: ListSection;
}) {
  const cards = section.cards ?? [];
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const activeCard =
    activeCardIndex === null ? null : cards[activeCardIndex] ?? null;

  useEffect(() => {
    setActiveCardIndex(null);
  }, [view.id]);

  return (
    <div className="list-tile-body stack-detail-tile">
      <div className="list-tile-head">
        <div className="stack-breadcrumb-row">
          <div className="stack-breadcrumb presentation-kicker">
            {activeCard ? (
              <>
                <button
                  type="button"
                  className="stack-breadcrumb-back"
                  onClick={() => setActiveCardIndex(null)}
                >
                  {section.kicker}
                </button>
                <span className="stack-breadcrumb-separator" aria-hidden="true">
                  &gt;
                </span>
                <span className="stack-breadcrumb-current">{activeCard.label}</span>
              </>
            ) : (
              <span className="stack-breadcrumb-root">{section.kicker}</span>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {activeCard ? (
          <motion.div
            key={`${view.id}-${activeCard.label}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={transition}
            className="stack-detail-panel"
          >
            <p className="stack-detail-copy">{activeCard.detail}</p>
          </motion.div>
        ) : (
          <motion.div
            key={`${view.id}-stack-grid`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={transition}
            className="stack-grid"
          >
            {cards.map((card, index) => {
              const shouldSpanWide =
                cards.length % 2 === 1 && index === cards.length - 1;

              return (
                <button
                  key={card.label}
                  type="button"
                  className={`stack-grid-item ${shouldSpanWide ? "is-wide" : ""}`}
                  onClick={() => setActiveCardIndex(index)}
                >
                  <span className="stack-grid-label">{card.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Typewriter() {
  const searchParams = useSearchParams();
  const requestedView = searchParams.get("view");
  const activeViewId = isViewId(requestedView) ? requestedView : "about";
  const activeView = viewMap[activeViewId];
  const showProjectTileSwap = isProjectView(activeView);

  const boardStyle = {
    "--state-accent": activeView.accent,
    "--state-accent-soft": activeView.accentSoft,
    "--state-dock-dot": activeView.dockDot,
  } as CSSProperties;

  return (
    <main className="command-page" style={boardStyle}>
      <section className="command-stage px-4 py-3 md:px-6 md:py-4">
        <div className="mx-auto max-w-[1560px]">
          <div className="command-board">
            <section className="command-tile command-tile-visual">
              <ViewVisual view={activeView} />
            </section>

            <section className="command-tile command-tile-overview">
              <OverviewTile view={activeView} />
            </section>

            <section className="command-tile command-tile-stack">
              {showProjectTileSwap ? (
                <ProjectDemoTile view={activeView} />
              ) : (
                <ListTile
                  view={activeView}
                  tileKey="stack"
                  section={activeView.stack}
                />
              )}
            </section>

            <section
              className={`command-tile command-tile-flow${
                activeView.id === "about" ? " command-tile-about-tools" : ""
              }`}
            >
              <ListTile
                view={activeView}
                tileKey={showProjectTileSwap ? "stack" : "flow"}
                section={showProjectTileSwap ? activeView.stack : activeView.flow}
              />
            </section>

            <section
              className={`command-tile command-tile-notes${
                activeView.id === "about" ? " command-tile-about-socials" : ""
              }`}
            >
              <ListTile view={activeView} tileKey="notes" section={activeView.notes} />
            </section>

            <nav
              className="command-tile command-tile-dock"
              aria-label="Project switcher"
            >
              <div className="dock-frame">
                {views.map((view) => {
                  const isActive = view.id === activeView.id;

                  return (
                    <Link
                      key={view.id}
                      href={getViewHref(view.id)}
                      replace
                      scroll={false}
                      aria-label={view.dock.label}
                      aria-current={isActive ? "page" : undefined}
                      className={`dock-app ${isActive ? "is-active" : ""}`}
                      style={{ "--dock-item-dot": view.dockDot } as CSSProperties}
                    >
                      <span
                        className={`dock-app-icon ${
                          view.dock.iconClassName ?? ""
                        }`}
                      >
                        {view.dock.imageSrc ? (
                          <Image
                            src={view.dock.imageSrc}
                            alt={view.dock.label}
                            fill
                            sizes="(max-width: 767px) 56px, (max-width: 1279px) 64px, 74px"
                            className="dock-app-image"
                          />
                        ) : (
                          <span className="dock-app-text">{view.dock.textIcon}</span>
                        )}
                      </span>
                      <span className="dock-active-dot" aria-hidden="true" />
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      </section>
    </main>
  );
}
