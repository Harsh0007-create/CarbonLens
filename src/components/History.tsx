import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ACTIVITY_META,
  ACTIVITY_TYPES,
  Activity,
  ActivityType,
  fmtDate,
  fmtKg,
  toISODate,
} from "../lib/carbon";

interface Props {
  activities: Activity[];
  onDelete: (id: string) => void;
}

type TypeFilter = "all" | ActivityType;
type RangePreset = "all" | "today" | "7d" | "30d" | "custom";

export default function History({ activities, onDelete }: Props) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [range, setRange] = useState<RangePreset>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    let fromISO = "";
    let toISO = "";
    const today = new Date();
    if (range === "today") {
      fromISO = toISO = toISODate(today);
    } else if (range === "7d") {
      const d = new Date();
      d.setDate(d.getDate() - 6);
      fromISO = toISODate(d);
      toISO = toISODate(today);
    } else if (range === "30d") {
      const d = new Date();
      d.setDate(d.getDate() - 29);
      fromISO = toISODate(d);
      toISO = toISODate(today);
    } else if (range === "custom") {
      fromISO = from;
      toISO = to;
    }

    // ISO date strings compare correctly lexicographically. Sorted newest
    // first, ties broken by insertion time.
    return activities
      .filter((a) => (typeFilter === "all" ? true : a.type === typeFilter))
      .filter((a) => (fromISO ? a.date >= fromISO : true))
      .filter((a) => (toISO ? a.date <= toISO : true))
      .sort((a, b) => (a.date === b.date ? b.createdAt - a.createdAt : b.date < a.date ? -1 : 1));
  }, [activities, typeFilter, range, from, to]);

  const filteredTotal = filtered.reduce((s, a) => s + a.co2, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-tour="history">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">History</h2>
          <p className="text-sm text-slate-500">
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"} · {fmtKg(filteredTotal)}{" "}
            CO₂ in view
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <FilterChip active={typeFilter === "all"} onClick={() => setTypeFilter("all")}>
          All types
        </FilterChip>
        {ACTIVITY_TYPES.map((t) => (
          <FilterChip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>
            {ACTIVITY_META[t].emoji} {ACTIVITY_META[t].label}
          </FilterChip>
        ))}
      </div>

      {/* Date filter — presets plus a custom range */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {(
          [
            ["all", "All time"],
            ["today", "Today"],
            ["7d", "Last 7 days"],
            ["30d", "Last 30 days"],
            ["custom", "Custom range"],
          ] as [RangePreset, string][]
        ).map(([key, label]) => (
          <FilterChip key={key} active={range === key} onClick={() => setRange(key)}>
            {label}
          </FilterChip>
        ))}
        {range === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
            />
            <span className="text-slate-400">→</span>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-emerald-500"
            />
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-12 text-center">
          <span className="mb-2 text-3xl">🍃</span>
          <p className="text-sm text-slate-400">
            {activities.length === 0
              ? "No activities logged yet. Head to the Log tab to add your first one."
              : "Nothing matches these filters."}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          <AnimatePresence initial={false}>
          {filtered.map((a, idx) => {
            const m = ACTIVITY_META[a.type];
            return (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24, height: 0, paddingTop: 0, paddingBottom: 0 }}
                transition={{ duration: 0.3, delay: Math.min(idx * 0.035, 0.5) }}
                className="group flex items-center gap-4 py-3"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                  style={{ background: `${m.color}18` }}
                >
                  {m.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-medium text-slate-900">{m.label}</span>
                    <span className="text-sm text-slate-500">
                      {a.quantity.toLocaleString()} {m.unitShort}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {fmtDate(a.date)}
                    {a.note ? ` · ${a.note}` : ""}
                  </div>
                </div>
                <span className="whitespace-nowrap font-semibold text-slate-900">
                  {fmtKg(a.co2)}
                </span>
                <button
                  onClick={() => onDelete(a.id)}
                  title="Delete entry"
                  className="rounded-lg p-2 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                  >
                    <path d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                  </svg>
                </button>
              </motion.li>
            );
          })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-emerald-500 bg-emerald-600 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}
