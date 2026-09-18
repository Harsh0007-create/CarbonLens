import { useMemo } from "react";
import { motion } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";
import { SpotlightCard } from "./effects";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ACTIVITY_META,
  ACTIVITY_TYPES,
  Activity,
  fmtKg,
  isInCurrentWeek,
  toISODate,
} from "../lib/carbon";

interface Props {
  activities: Activity[];
}

export default function Dashboard({ activities }: Props) {
  const total = useMemo(() => activities.reduce((s, a) => s + a.co2, 0), [activities]);
  const weekTotal = useMemo(
    () => activities.filter((a) => isInCurrentWeek(a.date)).reduce((s, a) => s + a.co2, 0),
    [activities]
  );
  const todayTotal = useMemo(() => {
    const t = toISODate(new Date());
    return activities.filter((a) => a.date === t).reduce((s, a) => s + a.co2, 0);
  }, [activities]);

  const byCategory = useMemo(() => {
    return ACTIVITY_TYPES.map((t) => {
      const items = activities.filter((a) => a.type === t);
      const co2 = items.reduce((s, a) => s + a.co2, 0);
      return {
        type: t,
        name: ACTIVITY_META[t].label,
        emoji: ACTIVITY_META[t].emoji,
        color: ACTIVITY_META[t].color,
        count: items.length,
        co2: Math.round(co2 * 100) / 100,
      };
    }).filter((c) => c.co2 > 0);
  }, [activities]);

  // Builds a continuous 14-day series (including zero-emission days) so the
  // trend chart renders an unbroken timeline.
  const last14 = useMemo(() => {
    const days: { date: string; label: string; co2: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = toISODate(d);
      const co2 = activities
        .filter((a) => a.date === iso)
        .reduce((s, a) => s + a.co2, 0);
      days.push({
        date: iso,
        label: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        co2: Math.round(co2 * 100) / 100,
      });
    }
    return days;
  }, [activities]);

  const treesPerYear = total / 21;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Today" kg={todayTotal} sub="CO₂ emitted" emoji="📅" delay={0} />
        <StatCard label="This week" kg={weekTotal} sub="Mon–Sun" emoji="🗓️" delay={0.1} />
        <StatCard
          label="All time"
          kg={total}
          sub={total > 0 ? `≈ ${treesPerYear.toFixed(1)} tree-years to absorb` : "log something!"}
          emoji="🌍"
          delay={0.2}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category breakdown: donut for shape, sorted legend for exact values */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          data-tour="category-chart"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-1 text-lg font-semibold text-slate-900">Footprint by category</h3>
          <p className="mb-4 text-sm text-slate-500">All-time share of each activity type</p>
          {byCategory.length === 0 ? (
            <EmptyChart msg="Log your first activity to see the breakdown." />
          ) : (
            <>
              <div className="relative h-56">
                {/* Animated total in the donut's center */}
                <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.9, type: "spring", stiffness: 200, damping: 16 }}
                    className="text-center"
                  >
                    <div className="font-display text-xl font-bold text-slate-900">{fmtKg(total)}</div>
                    <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">total CO₂</div>
                  </motion.div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={byCategory}
                      dataKey="co2"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      strokeWidth={2}
                      isAnimationActive
                      animationBegin={200}
                      animationDuration={1100}
                      animationEasing="ease-out"
                    >
                      {byCategory.map((c) => (
                        <Cell key={c.type} fill={c.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [`${Number(v ?? 0).toFixed(2)} kg CO₂`, ""]}
                      contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {byCategory
                  .slice()
                  .sort((a, b) => b.co2 - a.co2)
                  .map((c, i) => (
                    <motion.div
                      key={c.type}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 + i * 0.09 }}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ background: c.color }}
                      />
                      <span className="w-32 text-slate-700">
                        {c.emoji} {c.name}
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(c.co2 / total) * 100}%` }}
                          transition={{ duration: 0.9, delay: 0.6 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                          className="h-2 rounded-full"
                          style={{ background: c.color }}
                        />
                      </div>
                      <span className="w-20 text-right font-semibold text-slate-900">
                        {fmtKg(c.co2)}
                      </span>
                      <span className="w-10 text-right text-xs text-slate-400">
                        {((c.co2 / total) * 100).toFixed(0)}%
                      </span>
                    </motion.div>
                  ))}
              </div>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          data-tour="trend-chart"
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h3 className="mb-1 text-lg font-semibold text-slate-900">Last 14 days</h3>
          <p className="mb-4 text-sm text-slate-500">Daily CO₂ emissions (kg)</p>
          {activities.length === 0 ? (
            <EmptyChart msg="Your daily trend will appear here." />
          ) : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={last14} margin={{ top: 10, right: 5, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "#94a3b8" }}
                    interval={1}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v) => [`${Number(v ?? 0).toFixed(2)} kg CO₂`, "Emissions"]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
                  />
                  <Bar
                    dataKey="co2"
                    fill="url(#trendFill)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={26}
                    isAnimationActive
                    animationBegin={350}
                    animationDuration={1200}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  kg,
  sub,
  emoji,
  delay,
}: {
  label: string;
  kg: number;
  sub: string;
  emoji: string;
  delay: number;
}) {
  const inTonnes = kg >= 1000;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
    >
      <SpotlightCard className="card card-lift p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">{label}</span>
          <span className="animate-bounce-subtle text-xl" style={{ animationDelay: `${delay}s` }}>{emoji}</span>
        </div>
        <div className="font-display mt-1 text-2xl font-bold text-slate-900">
          <AnimatedNumber
            value={inTonnes ? kg / 1000 : kg}
            decimals={inTonnes ? 2 : kg < 100 ? 1 : 0}
            suffix={inTonnes ? " t" : " kg"}
            duration={1100}
          />{" "}
          <span className="text-sm font-medium text-slate-400">CO₂</span>
        </div>
        <div className="mt-0.5 text-xs text-slate-400">{sub}</div>
      </SpotlightCard>
    </motion.div>
  );
}

function EmptyChart({ msg }: { msg: string }) {
  return (
    <div className="flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
      <span className="mb-2 text-3xl">📊</span>
      <p className="text-sm text-slate-400">{msg}</p>
    </div>
  );
}
