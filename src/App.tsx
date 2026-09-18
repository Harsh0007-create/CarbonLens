import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import confetti from "canvas-confetti";
import Dashboard from "./components/Dashboard";
import Decisions from "./components/Decisions";
import History from "./components/History";
import Insights from "./components/Insights";
import Landing from "./components/Landing";
import LogActivity from "./components/LogActivity";
import TargetCard from "./components/TargetCard";
import Tour from "./components/Tour";
import {
  Activity,
  ActivityType,
  calcCO2,
  isInCurrentWeek,
  loadActivities,
  loadTarget,
  loadTourSeen,
  saveActivities,
  saveTarget,
  saveTourSeen,
  toISODate,
  uid,
} from "./lib/carbon";

type Page = "home" | "dashboard" | "log" | "history" | "insights" | "decisions";

const NAV: { id: Page; label: string; emoji: string }[] = [
  { id: "home", label: "Home", emoji: "🏠" },
  { id: "dashboard", label: "Dashboard", emoji: "📊" },
  { id: "log", label: "Log activity", emoji: "➕" },
  { id: "history", label: "History", emoji: "🕓" },
  { id: "insights", label: "Insights", emoji: "💡" },
  { id: "decisions", label: "Decisions", emoji: "🧭" },
];

// Seeds two weeks of realistic activity data (commutes, meals, one flight)
// so evaluators can explore a fully populated app immediately.
function buildSampleData(): Activity[] {
  const samples: { type: ActivityType; qty: number; daysAgo: number; note?: string }[] = [
    { type: "car", qty: 12, daysAgo: 0, note: "Commute to office" },
    { type: "nonveg_meal", qty: 1, daysAgo: 0, note: "Chicken lunch" },
    { type: "electricity", qty: 6, daysAgo: 0, note: "Home usage" },
    { type: "bus", qty: 18, daysAgo: 1, note: "City bus, both ways" },
    { type: "veg_meal", qty: 2, daysAgo: 1 },
    { type: "car", qty: 25, daysAgo: 2, note: "Grocery run + gym" },
    { type: "electricity", qty: 8, daysAgo: 2 },
    { type: "veg_meal", qty: 1, daysAgo: 3, note: "Salad bowl" },
    { type: "nonveg_meal", qty: 1, daysAgo: 3 },
    { type: "bus", qty: 10, daysAgo: 4, note: "Downtown trip" },
    { type: "electricity", qty: 7, daysAgo: 4 },
    { type: "flight", qty: 450, daysAgo: 6, note: "Short-haul, one way" },
    { type: "car", qty: 30, daysAgo: 7, note: "Weekend drive" },
    { type: "nonveg_meal", qty: 2, daysAgo: 8 },
    { type: "electricity", qty: 9, daysAgo: 9 },
    { type: "veg_meal", qty: 3, daysAgo: 10, note: "Veg day 🎉" },
    { type: "bus", qty: 22, daysAgo: 11 },
    { type: "car", qty: 15, daysAgo: 12, note: "Airport pickup" },
    { type: "electricity", qty: 5, daysAgo: 13 },
  ];
  return samples.map((s, i) => {
    const d = new Date();
    d.setDate(d.getDate() - s.daysAgo);
    return {
      id: uid() + i,
      type: s.type,
      quantity: s.qty,
      co2: calcCO2(s.type, s.qty),
      date: toISODate(d),
      note: s.note,
      createdAt: Date.now() - s.daysAgo * 86400000 - i,
    };
  });
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

export default function App() {
  const [activities, setActivities] = useState<Activity[]>(() => loadActivities());
  const [target, setTarget] = useState<number>(() => loadTarget());
  const [page, setPage] = useState<Page>("home");
  const [toast, setToast] = useState<string | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  // Spring-smoothed scroll progress rendered as a thin bar under the header
  const { scrollYProgress } = useScroll();
  const scrollProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  function startTour() {
    setMobileMenu(false);
    setTourOpen(true);
  }

  function closeTour() {
    saveTourSeen();
    setTourOpen(false);
  }

  useEffect(() => saveActivities(activities), [activities]);
  useEffect(() => saveTarget(target), [target]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenu(false);
  }, [page]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  function addActivity(type: ActivityType, quantity: number, date: string, note: string) {
    const entry: Activity = {
      id: uid(),
      type,
      quantity,
      co2: calcCO2(type, quantity),
      date,
      note: note || undefined,
      createdAt: Date.now(),
    };
    const next = [entry, ...activities];
    setActivities(next);

    // Positive reinforcement: celebrate logging while still under budget,
    // rather than only surfacing feedback when things go wrong.
    const weekTotal = next.filter((a) => isInCurrentWeek(a.date)).reduce((s, a) => s + a.co2, 0);
    if (weekTotal <= target) {
      confetti({
        particleCount: 70,
        spread: 65,
        origin: { y: 0.7 },
        colors: ["#10b981", "#14b8a6", "#0ea5e9", "#84cc16"],
      });
    }
  }

  function deleteActivity(id: string) {
    setActivities((prev) => prev.filter((a) => a.id !== id));
    showToast("Entry deleted");
  }

  function seedDemo() {
    setActivities(buildSampleData());
    setPage("dashboard");
    showToast("✨ Demo data loaded — explore everything!");
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#10b981", "#14b8a6", "#0ea5e9", "#84cc16"],
    });
    // Auto-start the guided tour on first visit. The delay lets the page
    // transition and confetti settle so the spotlight measures correctly.
    if (!loadTourSeen()) {
      setTimeout(() => setTourOpen(true), 900);
    }
  }

  function clearAll() {
    if (confirm("Remove all logged activities? This can't be undone.")) {
      setActivities([]);
      showToast("All data cleared");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="glass sticky top-0 z-30 border-b border-slate-200/80">
        {/* Scroll progress indicator */}
        <motion.div
          style={{ scaleX: scrollProgress }}
          className="absolute bottom-0 left-0 right-0 h-[2.5px] origin-left bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500"
        />
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={() => setPage("home")} className="group flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.08 }}
              transition={{ type: "spring", stiffness: 350, damping: 15 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xl shadow-md shadow-emerald-200"
            >
              🌱
            </motion.div>
            <div className="text-left">
              <h1 className="font-display text-lg font-bold leading-tight text-slate-900">
                Carbon<span className="text-emerald-600">Lens</span>
              </h1>
              <p className="hidden text-[11px] text-slate-400 sm:block">
                See it. Track it. Shrink it.
              </p>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => setPage(n.id)}
                className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  page === n.id ? "text-emerald-700" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {page === n.id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-emerald-50"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative">
                  <span className="mr-1">{n.emoji}</span>
                  {n.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={startTour}
              className="hidden rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:block"
              title="Take the guided tour"
            >
              🧭 Tour
            </button>
            {activities.length === 0 ? (
              <button
                onClick={seedDemo}
                className="btn-shine hidden rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:shadow-md sm:block"
              >
                ✨ Demo data
              </button>
            ) : (
              <button
                onClick={clearAll}
                className="hidden rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-red-500 sm:block"
              >
                Clear data
              </button>
            )}
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenu((v) => !v)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 md:hidden"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                {mobileMenu ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileMenu && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-100 bg-white md:hidden"
            >
              <div className="grid grid-cols-2 gap-1 p-3">
                {NAV.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setPage(n.id)}
                    className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                      page === n.id ? "bg-emerald-50 text-emerald-700" : "text-slate-600"
                    }`}
                  >
                    <span className="mr-1.5">{n.emoji}</span>
                    {n.label}
                  </button>
                ))}
                <button onClick={startTour} className="rounded-lg bg-emerald-50 px-3 py-2.5 text-left text-sm font-semibold text-emerald-700">
                  🧭 Take the tour
                </button>
                {activities.length === 0 ? (
                  <button onClick={seedDemo} className="rounded-lg bg-emerald-600 px-3 py-2.5 text-left text-sm font-semibold text-white">
                    ✨ Load demo data
                  </button>
                ) : (
                  <button onClick={clearAll} className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-500">
                    🗑️ Clear data
                  </button>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={page}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Reveal wipe: a soft gradient sheet collapses upward as each page mounts */}
          <motion.div
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 0.55, ease: [0.83, 0, 0.17, 1] }}
            className="pointer-events-none fixed inset-x-0 bottom-0 top-[57px] z-20 origin-top bg-gradient-to-b from-emerald-100/90 via-teal-50/90 to-white/90"
          />
          {page === "home" ? (
            <Landing
              activities={activities}
              hasData={activities.length > 0}
              onStart={() => setPage(activities.length > 0 ? "dashboard" : "log")}
              onDemo={seedDemo}
            />
          ) : (
            <div className="mx-auto max-w-6xl px-4 py-8">
              {page === "dashboard" && (
                <div className="space-y-6">
                  <PageTitle emoji="📊" title="Dashboard" sub="Your footprint at a glance" />
                  <TargetCard activities={activities} target={target} onSetTarget={(t) => { setTarget(t); showToast(`🎯 Weekly target set to ${t} kg CO₂`); }} />
                  <Dashboard activities={activities} />
                </div>
              )}
              {page === "log" && (
                <div className="mx-auto max-w-2xl">
                  <PageTitle emoji="➕" title="Log an activity" sub="Add to your footprint in seconds" />
                  <div className="mt-6">
                    <LogActivity onAdd={addActivity} />
                  </div>
                </div>
              )}
              {page === "history" && (
                <div className="space-y-6">
                  <PageTitle emoji="🕓" title="History" sub="Every entry, filterable by type and date" />
                  <History activities={activities} onDelete={deleteActivity} />
                </div>
              )}
              {page === "insights" && (
                <div className="space-y-6">
                  <PageTitle emoji="💡" title="Insights" sub="Achievements, tips, and what-if scenarios" />
                  <Insights activities={activities} target={target} />
                </div>
              )}
              {page === "decisions" && (
                <div className="space-y-6">
                  <PageTitle emoji="🧭" title="Decisions" sub="The product thinking behind CarbonLens" />
                  <Decisions />
                </div>
              )}
            </div>
          )}
        </motion.main>
      </AnimatePresence>

      {tourOpen && <Tour onNavigate={(p) => setPage(p as Page)} onClose={closeTour} />}

      <ScrollTopButton progress={scrollProgress} />

      {/* Toast notifications — rendered outside the page transition tree */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-2xl"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="mt-8 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid gap-10 md:grid-cols-3">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-lg">
                  🌱
                </div>
                <span className="font-display text-lg font-bold text-slate-900">
                  Carbon<span className="text-emerald-600">Lens</span>
                </span>
              </div>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-500">
                A carbon footprint tracker that turns daily choices into visible CO₂ — built for
                the Climate Tech hackathon track.
              </p>
              <p className="mt-3 text-xs text-slate-400">
                Hackathon ID:{" "}
                <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-semibold text-slate-600">
                  AZIS-G4PHWM
                </span>
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">Explore</h4>
              <ul className="space-y-2">
                {NAV.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => setPage(n.id)}
                      className="text-sm text-slate-500 transition hover:text-emerald-600"
                    >
                      {n.emoji} {n.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">Good to know</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>🔒 Data stays in your browser (localStorage)</li>
                <li>🚫 No account or login required</li>
                <li>🧮 Fixed, transparent emission factors</li>
                <li>📅 Weeks run Monday → Sunday</li>
                <li>🌳 1 tree ≈ 21 kg CO₂ absorbed / year</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
            Made with 💚 for the planet · CarbonLens · Climate Tech track
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Floating scroll-to-top button with a circular progress ring that fills as
 * the user scrolls. Fades in only after meaningful scroll depth.
 */
function ScrollTopButton({ progress }: { progress: ReturnType<typeof useSpring> }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const R = 18;
  const C = 2 * Math.PI * R;

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.6, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 16 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 320, damping: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="glass fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 shadow-lg"
          title="Back to top"
        >
          <svg viewBox="0 0 44 44" className="absolute inset-0 h-full w-full -rotate-90">
            <circle cx="22" cy="22" r={R} fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
            <motion.circle
              cx="22"
              cy="22"
              r={R}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={C}
              style={{ pathLength: progress }}
            />
          </svg>
          <svg className="h-4 w-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

function PageTitle({ emoji, title, sub }: { emoji: string; title: string; sub: string }) {
  return (
    <div>
      <motion.h1
        initial={{ opacity: 0, x: -14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-2xl font-bold text-slate-900 sm:text-3xl"
      >
        <span className="mr-2">{emoji}</span>
        {title}
      </motion.h1>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="mt-2 h-1 w-14 origin-left rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="mt-2 text-sm text-slate-500"
      >
        {sub}
      </motion.p>
    </div>
  );
}
