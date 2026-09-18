import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ACTIVITY_META,
  ACTIVITY_TYPES,
  ActivityType,
  calcCO2,
  fmtKg,
  todayISO,
} from "../lib/carbon";

interface Props {
  onAdd: (type: ActivityType, quantity: number, date: string, note: string) => void;
}

export default function LogActivity({ onAdd }: Props) {
  const [type, setType] = useState<ActivityType>("car");
  const [quantity, setQuantity] = useState<string>("");
  const [date, setDate] = useState<string>(todayISO());
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pendingAbsurd, setPendingAbsurd] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const meta = ACTIVITY_META[type];
  const qty = parseFloat(quantity);
  const validQty = Number.isFinite(qty) && qty > 0;
  const preview = validQty ? calcCO2(type, qty) : null;
  const isAbsurd = validQty && qty > meta.sanityMax;

  const maxDate = todayISO();

  const equivalentHint = useMemo(() => {
    if (preview === null) return null;
    if (preview < 1) return "≈ charging a phone " + Math.round(preview / 0.021) + " times";
    if (preview < 20) return "≈ " + (preview / 0.2).toFixed(0) + " km of car driving";
    return "≈ what " + (preview / 21).toFixed(1) + " trees absorb in a whole year";
  }, [preview]);

  function reset() {
    setQuantity("");
    setNote("");
    setPendingAbsurd(false);
    setError(null);
  }

  function submit(confirmAbsurd = false) {
    setError(null);
    if (!validQty) {
      setError("Please enter a quantity greater than 0.");
      return;
    }
    // Values above 1M units are physically impossible — reject outright.
    if (qty > 1_000_000) {
      setError(
        `That's over a million ${meta.unit} — even a rocket wouldn't log that. We can't accept values above 1,000,000. Please double-check your entry.`
      );
      return;
    }
    if (!date) {
      setError("Please pick a date.");
      return;
    }
    if (date > maxDate) {
      setError("You can't log activities in the future — the planet hasn't gotten there yet.");
      return;
    }
    if (isAbsurd && !confirmAbsurd) {
      setPendingAbsurd(true);
      return;
    }
    onAdd(type, qty, date, note.trim());
    setFlash(`Logged ${qty} ${meta.unitShort} of ${meta.label.toLowerCase()} → ${fmtKg(calcCO2(type, qty))} CO₂`);
    setTimeout(() => setFlash(null), 3500);
    reset();
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-tour="log-form">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Log an activity</h2>
          <p className="text-sm text-slate-500">Every choice counts. Add it to your footprint.</p>
        </div>
        <span className="text-3xl">{meta.emoji}</span>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {ACTIVITY_TYPES.map((t) => {
          const m = ACTIVITY_META[t];
          const active = t === type;
          return (
            <button
              key={t}
              type="button"
              onClick={() => {
                setType(t);
                setPendingAbsurd(false);
                setError(null);
              }}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition-all ${
                active
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="text-center leading-tight">{m.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mb-1 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
        Emission factor: <span className="font-semibold text-slate-700">{meta.factor} kg CO₂ per {meta.unitShort}</span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            {meta.quantityLabel} ({meta.unitShort})
          </span>
          <input
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
              setPendingAbsurd(false);
              setError(null);
            }}
            placeholder={type === "veg_meal" || type === "nonveg_meal" ? "e.g. 1" : "e.g. 10"}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">Date</span>
          <input
            type="date"
            value={date}
            max={maxDate}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="mb-1 block text-sm font-medium text-slate-700">
          Note <span className="font-normal text-slate-400">(optional)</span>
        </span>
        <input
          type="text"
          value={note}
          maxLength={80}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Commute to office"
          className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
        />
      </label>

      {/* Live impact preview — shows the CO₂ cost before the entry is saved */}
      <AnimatePresence>
      {preview !== null && (
        <motion.div
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: "auto", marginTop: 16 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"
        >
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-emerald-600">
              Estimated impact
            </div>
            <motion.div
              key={preview}
              initial={{ scale: 0.92, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-bold text-emerald-800"
            >
              {fmtKg(preview)} CO₂
            </motion.div>
            {equivalentHint && <div className="text-xs text-emerald-600">{equivalentHint}</div>}
          </div>
          <div className="animate-float-slow text-3xl">🌍</div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Sanity-check confirmation for implausible quantities. Unusual values
          can be legitimate, so the user confirms rather than being rejected;
          hard limits for impossible input live in submit(). */}
      {pendingAbsurd && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">🤔</span>
            <div className="flex-1">
              <div className="font-semibold text-amber-800">
                That's {qty.toLocaleString()} {meta.unitShort} — are you sure?
              </div>
              <p className="mt-1 text-sm text-amber-700">
                Typical daily entries for {meta.label.toLowerCase()} stay under{" "}
                {meta.sanityMax.toLocaleString()} {meta.unitShort}. This looks like it might be a
                typo, but if it's real (road trip across a continent?), we'll take your word for it.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => submit(true)}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                >
                  Yes, it's real — log it
                </button>
                <button
                  onClick={() => setPendingAbsurd(false)}
                  className="rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
                >
                  Oops, let me fix it
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {flash && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          ✅ {flash}
        </div>
      )}

      {!pendingAbsurd && (
        <button
          onClick={() => submit(false)}
          className="mt-5 w-full rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-[0.99]"
        >
          Add to footprint
        </button>
      )}
    </div>
  );
}
