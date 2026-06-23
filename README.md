# Vatsal Sharma — Portfolio

## Setup

```bash
npm install
npm run dev
```

## Before first run

1. **Add `grain.png` to `public/`** — the grain overlay references it immediately.
   Generate at: https://grainy-gradients.vercel.app/ (200×200 PNG noise tile)

2. **Write both essays** — add content to `lib/notes.ts` before launch:
   - `bkt-engine`: "Why I wrote the BKT engine from scratch"
   - `production-lessons`: "What production taught me that staging never did"

3. **Update `app/sitemap.ts`** — replace the base URL with your Vercel domain after deployment.

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS v3
- GSAP 3 + ScrollTrigger
- Framer Motion
- Lenis (smooth scroll)
- Vercel

## Deploy

Push to `github.com/VATSALSHARMA1511/portfolio_ig` → connect to Vercel → deploy.

No environment variables required.

## Pre-launch checklist

- [ ] `public/grain.png` exists
- [ ] Both essays written in `lib/notes.ts`
- [ ] Sitemap base URL updated
- [ ] Live project URLs verified:
  - https://opspilot-sand.vercel.app
  - https://vertex-dsa-ai.vercel.app
  - https://deadzone-production-4446.up.railway.app
- [ ] Lighthouse: Performance 90+, Accessibility 95+, SEO 100
- [ ] Custom cursor hidden on mobile
- [ ] Navbar active state works on scroll
- [ ] Live Kolkata clock updates

## Commit convention

```
git commit -m "built: step [N] — [what was built]"
```
