import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ACTIVITY_META,
  Activity,
  calcCO2,
  fmtKg,
  isInCurrentWeek,
} from "../lib/carbon";

interface Props {
  activities: Activity[];
  target: number;
}

const TIPS = [
  { emoji: "🚌", tip: "Swapping a 10 km car trip for the bus saves 1.2 kg of CO₂ — every single day, that's 438 kg a year." },
  { emoji: "🥗", tip: "One veg meal instead of non-veg saves 1.5 kg CO₂. Three swaps a week = 234 kg a year." },
  { emoji: "💡", tip: "Cutting 2 kWh of daily electricity (standby devices, old bulbs) saves 584 kg CO₂ a year." },
  { emoji: "🚲", tip: "Cycling short trips under 5 km is the single cheapest way to zero out transport emissions." },
  { emoji: "✈️", tip: "One less 1,000 km flight saves 250 kg CO₂ — often more than a month of car commuting." },
  { emoji: "🌳", tip: "A mature tree absorbs about 21 kg of CO₂ per year. Your dashboard shows your footprint in tree-years." },
];

export default function Insights({ activities, target }: Props) {
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 5000);
    return () => clearInterval(id);
  }, []);

  const stats = useMemo(() => {
    const total = activities.reduce((s, a) => s + a.co2, 0);
    const weekTotal = activities.filter((a) => isInCurrentWeek(a.date)).reduce((s, a) => s + a.co2, 0);
    const vegMeals = activities.filter((a) => a.type === "veg_meal").reduce((s, a) => s + a.quantity, 0);
    const busKm = activities.filter((a) => a.type === "bus").reduce((s, a) => s + a.quantity, 0);
    const carKm = activities.filter((a) => a.type === "car").reduce((s, a) => s + a.quantity, 0);
    const daysLogged = new Set(activities.map((a) => a.date)).size;
    return { total, weekTotal, vegMeals, busKm, carKm, daysLogged };
  }, [activities]);

  const badges = [
    { emoji: "🌱", name: "First Step", desc: "Log your first activity", earned: activities.length >= 1 },
    { emoji: "📅", name: "Habit Builder", desc: "Log on 5 different days", earned: stats.daysLogged >= 5 },
    { emoji: "🥗", name: "Plant Power", desc: "Log 5 veg meals", earned: stats.vegMeals >= 5 },
    { emoji: "🚌", name: "Transit Hero", desc: "Log 25 km by bus", earned: stats.busKm >= 25 },
    { emoji: "🎯", name: "Budget Keeper", desc: "Stay under weekly target", earned: activities.length > 0 && stats.weekTotal <= target },
    { emoji: "📊", name: "Data Nerd", desc: "Log 15+ activities", earned: activities.length >= 15 },
  ];
  const earnedCount = badges.filter((b) => b.earned).length;

  // What-if simulator
  const [simKm, setSimKm] = useState(10);
  const [simMeals, setSimMeals] = useState(3);
  const carToBus = calcCO2("car", simKm) - calcCO2("bus", simKm);
  const mealSwap = simMeals * (ACTIVITY_META.nonveg_meal.factor - ACTIVITY_META.veg_meal.factor);
  const weeklySave = carToBus * 5 + mealSwap;
  const yearlySave = weeklySave * 52;

  return (
    <div className="space-y-6">
      {/* Eco-tip carousel — auto-rotates every 5s with manual dot navigation */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-6">
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-emerald-600">
          💡 Eco tip {tipIdx + 1} / {TIPS.length}
        </div>
        <div className="relative h-16 sm:h-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={tipIdx}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0 flex items-center gap-3"
            >
              <span className="text-3xl">{TIPS[tipIdx].emoji}</span>
              <p className="text-sm font-medium text-slate-700 sm:text-base">{TIPS[tipIdx].tip}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="mt-3 flex gap-1.5">
          {TIPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setTipIdx(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === tipIdx ? "w-6 bg-emerald-500" : "w-1.5 bg-emerald-200 hover:bg-emerald-300"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-tour="badges">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Achievements</h2>
            <p className="text-sm text-slate-500">
              {earnedCount} of {badges.length} unlocked
            </p>
          </div>
          <div className="relative h-14 w-14">
            <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <motion.circle
                cx="18" cy="18" r="15" fill="none" stroke="#10b981" strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 15}
                initial={{ strokeDashoffset: 2 * Math.PI * 15 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 15 * (1 - earnedCount / badges.length) }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">
              {Math.round((earnedCount / badges.length) * 100)}%
            </span>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges.map((b, i) => (
            <motion.div
              key={b.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={b.earned ? { scale: 1.04, rotate: -1.5, y: -3 } : { scale: 1.01 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.35, type: "spring", stiffness: 260, damping: 18 }}
              className={`flex items-center gap-3 rounded-xl border p-4 transition-all ${
                b.earned
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-slate-200 bg-slate-50 opacity-60 grayscale"
              }`}
            >
              <span className={`text-3xl ${b.earned ? "" : ""}`}>{b.emoji}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  {b.name}
                  {b.earned && <span className="text-emerald-500">✓</span>}
                </div>
                <div className="text-xs text-slate-500">{b.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* What-if simulator — assumes a 5-day commuting week for projections */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">🔮 What-if simulator</h2>
        <p className="mb-6 text-sm text-slate-500">
          Drag the sliders to see how small swaps compound into big savings.
        </p>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-7">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  🚗→🚌 Daily commute switched to bus
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-700">
                  {simKm} km
                </span>
              </div>
              <input
                type="range" min={0} max={60} value={simKm}
                onChange={(e) => setSimKm(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <p className="mt-1 text-xs text-slate-400">
                Saves {fmtKg(carToBus)} per weekday ({fmtKg(carToBus * 5)}/week)
              </p>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                  🍗→🥗 Weekly meals switched to veg
                </span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-700">
                  {simMeals} meals
                </span>
              </div>
              <input
                type="range" min={0} max={21} value={simMeals}
                onChange={(e) => setSimMeals(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
              <p className="mt-1 text-xs text-slate-400">
                Saves {fmtKg(mealSwap)} per week
              </p>
            </div>
          </div>

          <motion.div
            key={yearlySave.toFixed(0)}
            initial={{ scale: 0.97, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 p-8 text-center text-white shadow-lg"
          >
            <div className="text-sm font-medium text-emerald-100">You'd save every year</div>
            <div className="mt-1 text-4xl font-extrabold sm:text-5xl">{fmtKg(yearlySave)}</div>
            <div className="mt-1 text-sm text-emerald-100">of CO₂</div>
            <div className="mt-4 rounded-xl bg-white/15 px-4 py-2 text-sm backdrop-blur">
              🌳 = {(yearlySave / 21).toFixed(1)} trees working for a year
            </div>
          </motion.div>
        </div>
      </div>

      {activities.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">📈 Your numbers</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <InsightPill emoji="🗓️" label="Days with logs" value={`${stats.daysLogged}`} />
            <InsightPill emoji="🚗" label="Car distance tracked" value={`${stats.carKm.toLocaleString()} km`} />
            <InsightPill emoji="🌍" label="Lifetime footprint" value={fmtKg(stats.total)} />
          </div>
        </div>
      )}
    </div>
  );
}

function InsightPill({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
      <span className="text-2xl">{emoji}</span>
      <div>
        <div className="text-lg font-bold text-slate-900">{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
      </div>
    </div>
  );
}
