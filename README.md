# CarbonLens — Carbon Footprint Tracker

**Hackathon ID: AZIS-G4PHWM**

**Live app:** https://carbon-lens-jzz7plzmj-harsh-pareto-app.vercel.app

CarbonLens turns everyday choices into a carbon footprint you can actually see. You log a car ride, a flight, some electricity or a meal, and the app shows how much CO₂ it added, where your emissions come from, and whether you're on track for your weekly target.

## Track

**Climate Tech — Carbon footprint tracker**

**Standard API:** I did not implement the standard API for this track. Everything is done through the UI, so the features should be tested with a browser agent.

## The five required features

1. **Log an activity.** Pick one of six types (car, bus, flight, electricity, veg meal, non-veg meal), enter a quantity and a date, and add a note if you want. You see the CO₂ for the entry before you save it.
2. **CO₂ calculation.** I used the fixed factors from the brief: car 0.20 kg/km, bus 0.08 kg/km, flight 0.25 kg/km, electricity 0.80 kg/kWh, veg meal 0.5 kg and non-veg meal 2.0 kg. They are shown on the log form, so there is no hidden math.
3. **Dashboard.** Totals for today, this week and all time, a per-category breakdown (donut chart plus a table), and a 14-day trend chart.
4. **Weekly target.** You set your own weekly budget in kg of CO₂. A progress bar shows how much you've used, a marker shows where an even pace would put you today, and the card turns green, amber or red depending on how you're doing.
5. **History and filter.** Every entry in one list. You can filter by activity type and by date (today, last 7 days, last 30 days or a custom range), and delete entries.

## A few extras

- A landing page with a short guided tour that starts the first time you load demo data. You can skip it, and it doesn't repeat.
- An Insights page with eco-tips, six achievement badges and a what-if simulator that shows the yearly savings from swapping car trips for the bus or non-veg meals for veg ones.
- Small touches like animated counters, page transitions and confetti when you log something and stay under budget.
- A demo data button that fills the app with two weeks of realistic entries, so you can explore it straight away.

## Decision points

My choices and reasoning for the nudge, the absurd input and the week are in [DECISIONS.md](./DECISIONS.md). They are also summarized on the Decisions page inside the app.

## Tech

- React 19 and TypeScript
- Vite
- Tailwind CSS 4
- Framer Motion for animations
- Recharts for the charts
- canvas-confetti for the celebrations

All data is stored in your browser with `localStorage`. There is no backend.

## Run it locally

```bash
npm install
npm run dev        # start the dev server
npm run build      # production build into dist/
npm run preview    # serve the production build
```

## Test credentials

None needed. There is no login or signup, so every feature is open. Just open the app and click **" Try with demo data"** to fill it in, or start logging your own activities.