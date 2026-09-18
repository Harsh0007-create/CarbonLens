import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";

export interface TourStep {
  page: string;
  selector: string;
  emoji: string;
  title: string;
  body: string;
}

const STEPS: TourStep[] = [
  {
    page: "dashboard",
    selector: '[data-tour="target"]',
    emoji: "🎯",
    title: "Your weekly CO₂ budget",
    body: "Set a weekly target and watch the bar fill as you log. The little dark tick is your pace marker — it shows where an even daily spend would put you today, so you know mid-week if you're on track.",
  },
  {
    page: "dashboard",
    selector: '[data-tour="category-chart"]',
    emoji: "🍩",
    title: "Footprint by category",
    body: "This donut breaks your total footprint into car, bus, flights, electricity and meals — so you instantly see what's driving your emissions.",
  },
  {
    page: "dashboard",
    selector: '[data-tour="trend-chart"]',
    emoji: "📈",
    title: "Your 14-day trend",
    body: "Daily bars show how your emissions rise and fall. Big spike? Probably that flight. Watch this bend downward as you make greener choices.",
  },
  {
    page: "log",
    selector: '[data-tour="log-form"]',
    emoji: "✏️",
    title: "Log anything in seconds",
    body: "Pick an activity, type a quantity, and see the CO₂ impact live before you save — with transparent emission factors shown right on the form.",
  },
  {
    page: "history",
    selector: '[data-tour="history"]',
    emoji: "🔍",
    title: "Filter your full history",
    body: "Every entry lives here. Slice by activity type or any date range — today, last 7 days, last 30, or a custom window.",
  },
  {
    page: "insights",
    selector: '[data-tour="badges"]',
    emoji: "🏅",
    title: "Earn achievements",
    body: "Unlock badges for green habits — veg meals, bus rides, staying under budget. Scroll down for eco-tips and the what-if savings simulator. That's the tour — happy tracking! 🌱",
  },
];

interface Props {
  onNavigate: (page: string) => void;
  onClose: () => void;
}

const PAD = 10;
const TOOLTIP_W = 340;
const TOOLTIP_H = 220;

export default function Tour({ onNavigate, onClose }: Props) {
  const [idx, setIdx] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const step = STEPS[idx];
  const isLast = idx === STEPS.length - 1;

  useEffect(() => {
    setRect(null);
    onNavigate(step.page);
    let cancelled = false;
    let tries = 0;

    const locate = () => {
      if (cancelled) return;
      const el = document.querySelector(step.selector) as HTMLElement | null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => {
          if (!cancelled) {
            const found = document.querySelector(step.selector) as HTMLElement | null;
            if (found) setRect(found.getBoundingClientRect());
          }
        }, 480);
      } else if (tries++ < 50) {
        setTimeout(locate, 60);
      }
    };
    // Delay measurement until the page transition completes; retry while
    // the target element mounts after navigation.
    setTimeout(locate, 250);

    const remeasure = () => {
      const el = document.querySelector(step.selector) as HTMLElement | null;
      if (el) setRect(el.getBoundingClientRect());
    };
    window.addEventListener("resize", remeasure);
    window.addEventListener("scroll", remeasure, true);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("scroll", remeasure, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  function finish() {
    // Leaf-shaped confetti for the finale, with a plain-color fallback for
    // browsers that don't support text shapes.
    try {
      const leaf = confetti.shapeFromText({ text: "🍃", scalar: 2 });
      confetti({ particleCount: 45, spread: 80, origin: { y: 0.6 }, shapes: [leaf], scalar: 2 });
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.65 }, colors: ["#10b981", "#14b8a6", "#84cc16"] });
    } catch {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.65 },
        colors: ["#10b981", "#14b8a6", "#0ea5e9", "#84cc16"],
      });
    }
    onClose();
  }

  // Tooltip placement: below the highlight when space allows, above
  // otherwise, clamped to the viewport on narrow screens.
  let tooltipStyle: React.CSSProperties = {
    left: "50%",
    top: "50%",
    transform: "translate(-50%, -50%)",
  };
  if (rect) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const below = rect.bottom + PAD + TOOLTIP_H < vh;
    const left = Math.min(Math.max(rect.left + rect.width / 2 - TOOLTIP_W / 2, 12), vw - TOOLTIP_W - 12);
    tooltipStyle = below
      ? { left, top: rect.bottom + PAD + 8 }
      : { left, top: Math.max(rect.top - PAD - 8 - TOOLTIP_H, 12) };
  }

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Blocks page interaction while the tour is active */}
      <div className="absolute inset-0" onClick={() => {}} />

      {/* Spotlight: an oversized box-shadow darkens everything around the
          highlighted element, and animates smoothly between targets. */}
      {rect ? (
        <motion.div
          key={`hl-${idx}`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            left: rect.left - PAD,
            top: rect.top - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
          }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute rounded-2xl border-2 border-emerald-400"
          style={{
            left: rect.left - PAD,
            top: rect.top - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: "0 0 0 9999px rgba(15, 23, 42, 0.62)",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-slate-900/62" style={{ background: "rgba(15,23,42,0.62)" }} />
      )}

      {/* Tooltip card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.3 }}
          className="absolute rounded-2xl bg-white p-5 shadow-2xl"
          style={{ ...tooltipStyle, width: TOOLTIP_W, maxWidth: "calc(100vw - 24px)" }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                {step.emoji}
              </span>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                  Tour · {idx + 1} of {STEPS.length}
                </div>
                <h3 className="font-bold text-slate-900">{step.title}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
              title="Skip tour"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-slate-600">{step.body}</p>

          {/* Progress dots */}
          <div className="mt-4 flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx ? "w-6 bg-emerald-500" : i < idx ? "w-1.5 bg-emerald-300" : "w-1.5 bg-slate-200"
                }`}
              />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={onClose}
              className="text-xs font-medium text-slate-400 underline-offset-2 transition hover:text-slate-600 hover:underline"
            >
              Skip tour
            </button>
            <div className="flex gap-2">
              {idx > 0 && (
                <button
                  onClick={() => setIdx((i) => i - 1)}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={() => (isLast ? finish() : setIdx((i) => i + 1))}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 active:scale-95"
              >
                {isLast ? "Finish 🎉" : "Next →"}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
