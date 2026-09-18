import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";
import Gauge from "./Gauge";
import {
  Activity,
  dayOfWeekMon,
  fmtKg,
  isInCurrentWeek,
  toISODate,
  weekEnd,
  weekStart,
} from "../lib/carbon";

interface Props {
  activities: Activity[];
  target: number;
  onSetTarget: (t: number) => void;
}

export default function TargetCard({ activities, target, onSetTarget }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(target));

  const now = new Date();
  const start = weekStart(now);
  const end = weekEnd(now);
  const dayNum = dayOfWeekMon(now); // 1..7

  const weekTotal = useMemo(
    () =>
      activities
        .filter((a) => isInCurrentWeek(a.date))
        .reduce((s, a) => s + a.co2, 0),
    [activities]
  );

  const pct = target > 0 ? (weekTotal / target) * 100 : 0;
  // Pro-rated share of the budget for this point in the week — by day N,
  // an even pace would have consumed N/7 of the target.
  const paceBudget = (target / 7) * dayNum;
  const remaining = target - weekTotal;
  const exceeded = weekTotal > target;
  const aheadOfPace = weekTotal > paceBudget && !exceeded;

  // Three-tier nudge: green (on track), amber (ahead of pace), red (over).
  // Intentionally encouraging — no shaming, no blocking (see DECISIONS.md).
  let status: { tone: "green" | "amber" | "red"; title: string; msg: string; emoji: string };
  if (exceeded) {
    status = {
      tone: "red",
      title: "Target exceeded — but the week isn't over for good choices",
      msg: `You're ${fmtKg(weekTotal - target)} over your ${fmtKg(target)} target. No shame — awareness is the win. Try a bus instead of the car, or a veg meal tonight, and set a fresh target Monday.`,
      emoji: "🔴",
    };
  } else if (aheadOfPace) {
    status = {
      tone: "amber",
      title: "Running ahead of pace",
      msg: `By day ${dayNum} of 7, an even pace would be ${fmtKg(paceBudget)}. You're at ${fmtKg(weekTotal)} — still under target with ${fmtKg(remaining)} left, but ease off to stay green.`,
      emoji: "🟡",
    };
  } else {
    status = {
      tone: "green",
      title: "On track — nice work",
      msg: `You've used ${fmtKg(weekTotal)} of your ${fmtKg(target)} weekly budget with ${fmtKg(Math.max(remaining, 0))} to spare. Keep it up!`,
      emoji: "🟢",
    };
  }

  const toneStyles = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    red: "border-red-200 bg-red-50 text-red-800",
  };
  const barColor = exceeded ? "bg-red-500" : aheadOfPace ? "bg-amber-500" : "bg-emerald-500";

  const fmtRange = `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;

  function saveDraft() {
    const n = parseFloat(draft);
    if (Number.isFinite(n) && n > 0 && n <= 100000) {
      onSetTarget(Math.round(n * 10) / 10);
      setEditing(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="target-card" data-tour="target">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Weekly target</h2>
          <p className="text-sm text-slate-500">
            Week of {fmtRange} · starts Monday · day {dayNum} of 7
          </p>
        </div>
        {!editing ? (
          <button
            onClick={() => {
              setDraft(String(target));
              setEditing(true);
            }}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            ✏️ Edit target
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              step="any"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveDraft()}
              className="w-28 rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              autoFocus
            />
            <span className="text-sm text-slate-500">kg</span>
            <button
              onClick={saveDraft}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid items-center gap-6 sm:grid-cols-[1fr_auto]">
        <div>
          <div className="mb-2 flex items-end justify-between">
            <div>
              <span className="font-display text-3xl font-bold text-slate-900">
                <AnimatedNumber value={weekTotal} decimals={weekTotal < 100 ? 2 : 1} suffix=" kg" duration={1000} />
              </span>
              <span className="ml-2 text-sm text-slate-500">of {fmtKg(target)} target</span>
            </div>
            <span
              className={`text-sm font-semibold ${
                exceeded ? "text-red-600" : aheadOfPace ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              <AnimatedNumber value={pct} decimals={0} suffix="%" duration={1000} />
            </span>
          </div>

          {/* Progress bar with pace marker (overflow-visible for the tick) */}
          <div className="relative h-4 w-full overflow-visible rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pct, 100)}%` }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className={`h-4 rounded-full ${barColor}`}
            />
            {/* pace marker for today */}
            <div
              className="absolute -top-1 h-6 w-0.5 bg-slate-400"
              style={{ left: `${Math.min((dayNum / 7) * 100, 100)}%` }}
              title={`Even pace for day ${dayNum}: ${fmtKg(paceBudget)}`}
            />
            <div
              className="absolute top-5 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-slate-400"
              style={{ left: `${Math.min((dayNum / 7) * 100, 100)}%` }}
            >
              pace {fmtKg(paceBudget)}
            </div>
          </div>
        </div>

        {/* CO₂ speedometer — spring needle mirrors the budget consumption */}
        <div className="mx-auto w-44 sm:w-48">
          <Gauge percent={pct} label="of weekly budget" />
        </div>
      </div>

      <motion.div
        key={status.tone}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className={`mt-8 rounded-xl border p-4 ${toneStyles[status.tone]}`}
      >
        <div className="flex items-start gap-3">
          <span className="text-xl">{status.emoji}</span>
          <div>
            <div className="font-semibold">{status.title}</div>
            <p className="mt-0.5 text-sm opacity-90">{status.msg}</p>
          </div>
        </div>
      </motion.div>

      <p className="mt-3 text-xs text-slate-400">
        Today is {toISODate(now)} · the dark tick shows where an even daily pace would put you.
      </p>
    </div>
  );
}
