# 🌱 CarbonLens — Carbon Footprint Tracker

**Hackathon ID: AZIS-G4PHWM**

A climate-tech web app that turns daily choices into a visible carbon footprint. Log activities, watch your CO₂ add up in real time, and stay under your weekly target.

## Track

**Climate Tech — Carbon footprint tracker**

Standard API for the track: **not implemented** — all features are exercised through the UI (grade via browser agent).

## Required features

1. **Log an activity** — six activity types (car, bus, flight, electricity, veg meal, non-veg meal) with quantity, date, and optional note. Live CO₂ preview with real-world equivalents before saving.
2. **CO₂ calculation** — fixed factors: car 0.20 kg/km · bus 0.08 kg/km · flight 0.25 kg/km · electricity 0.80 kg/kWh · veg meal 0.5 kg · non-veg meal 2.0 kg. Factors are displayed on the log form and in a reference table — no hidden math.
3. **Dashboard** — today / this-week / all-time totals, per-category breakdown (animated donut + sorted table), and a 14-day daily trend chart.
4. **Weekly target** — user-set weekly kg CO₂ budget with an animated progress bar, a pro-rated pace marker, and a three-tier nudge (green → amber → red).
5. **History & filter** — full log filterable by activity type and date (today / 7 days / 30 days / custom range), with delete.

## Beyond the brief

- **Animated landing page** — staggered blur-reveal headline, mouse-parallax aurora background, dot-grid backdrop, emission-factor ticker (pauses on hover), 3D-tilt feature cards, and scroll-revealed sections.
- **Guided tour** — a six-step spotlight tour auto-starts the first time demo data is loaded, covering the target card, both charts, logging, history filters, and achievements. Skippable at any point; never repeats once seen (localStorage flag); replayable via the 🧭 Tour button.
- **Insights page** — rotating eco-tips carousel, six unlockable achievement badges with an animated progress ring, and an interactive what-if simulator projecting yearly savings from car→bus and non-veg→veg swaps.
- **Micro-interactions throughout** — spring-physics buttons with shine sweeps, scroll progress bar, animated number counters, page transitions, staggered list animations, confetti on under-budget logging, toast notifications, and a responsive glass-morphism header.
- **Signature animation systems** — a canvas leaf-particle layer drifting through the hero, an SVG CO₂ speedometer with a spring-physics needle on the dashboard, cursor-spotlight cards, a typewriter headline, magnetic CTAs, a gradient reveal-wipe on every page change, leaf-emoji confetti at the tour finale, and a scroll-to-top button with a live progress ring.
- **Demo data** — one click seeds two weeks of realistic activity so evaluators can explore a fully populated app instantly.

All data persists in `localStorage`. **No authentication** — every feature is accessible without an account, as required.

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- Framer Motion — page transitions, springs, parallax, scroll-linked animation
- Recharts — charts
- canvas-confetti — celebrations
- Inter + Space Grotesk type pairing

## Run steps

```bash
npm install
npm run dev        # local dev server
npm run build      # production build → dist/
npm run preview    # serve the production build
```

## Test credentials

None required — the app has no login. Open the URL and click **"✨ Try with demo data"** to populate the app, or log activities manually.

## Decision points

See [DECISIONS.md](./DECISIONS.md) — also summarized in-app on the **Decisions** page.
