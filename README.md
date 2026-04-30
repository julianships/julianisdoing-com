# julianisdoing.com

Source for [julianalbou.com](https://www.julianalbou.com), a personal portfolio site built with Next.js.

The site is meant to do two jobs:

- present a clear public view of the products I have shipped
- act as a lightweight project index for live work like Victus, Praise Lock, PhotoCV.ai, and internal systems such as Victus Content Ops

This repo is the website layer only. It is not a public dump of the underlying commercial product repos.

## Stack

- Next.js 15
- React 19
- TypeScript
- Framer Motion
- custom CSS

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Project structure

```text
src/app/
  layout.tsx         Site metadata and root layout
  page.tsx           Main portfolio route
  links/             Secondary links page

src/components/
  typewriter.tsx     Main interactive portfolio experience
  ui/                Shared UI primitives

public/
  profile-assets/    Profile imagery
  projects/          Project-specific media
  tool-logos/        Tool and stack logos
```

## What the site emphasizes

- a concise personal intro
- shipped products instead of speculative concepts
- product context, metrics, and technical constraints
- visual walkthroughs that make the work legible quickly

## Notes

- Some live products shown on the site are backed by private commercial repos.
- This repo focuses on the public presentation layer and associated assets.
- Internal planning files and local agent-tooling config are intentionally not part of the public-facing project story.
