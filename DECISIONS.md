# DECISIONS.md — CarbonLens

## DP1 · The nudge

**Choice: warn + encourage. Never shame, never block.**

When the weekly target is crossed, the app shows a clear red state with the exact overage and an encouraging, actionable suggestion (take the bus, pick a veg meal, reset the target Monday). Logging is never blocked, because blocking would corrupt the data and defeat the purpose of tracking — and shame is known to reduce long-term engagement in habit apps. An amber "ahead of pace" warning also fires *before* the target is crossed, so the red state rarely comes as a surprise.

## DP2 · Absurd input

**Choice: soft confirmation above a per-type sanity threshold; hard rejection only for the impossible.**

An entry above a per-activity threshold (e.g. 2,000 km of car travel, 20,000 km flight, 500 kWh) triggers a friendly "That's X — are you sure?" confirmation with explicit "Yes, it's real" / "Let me fix it" choices. Unusual values can be legitimate (cross-country road trips, long-haul flights), so the user gets the final say rather than a silent rejection. Only physically impossible values are hard-rejected — quantities ≤ 0, values above 1,000,000 units, and future dates — since those can only be errors and would poison the dashboard.

## DP3 · The week

**Choice: ISO week (Monday 00:00 → Sunday 23:59) with a pro-rated pace marker.**

Weeks start Monday, matching ISO-8601 and how most people mentally frame "this week" (commute emissions cluster Mon–Fri). Mid-week progress is shown two ways: the percentage of the total weekly budget consumed, plus a "pace tick" on the progress bar marking target ÷ 7 × days-elapsed — so on a Wednesday the user knows whether being at 60% of budget is fine or a problem, instead of only finding out on Sunday.
