import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";
import LeafParticles from "./LeafParticles";
import { Magnetic, SpotlightCard, Typewriter } from "./effects";
import { ACTIVITY_META, ACTIVITY_TYPES, Activity } from "../lib/carbon";

interface Props {
  activities: Activity[];
  onStart: () => void;
  onDemo: () => void;
  hasData: boolean;
}

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

/** Headline words cascade in with a blur-to-sharp reveal. */
function StaggeredHeadline() {
  const words: { text: string; gradient?: boolean }[] = [
    { text: "Your" },
    { text: "daily" },
    { text: "choices," },
    { text: "made", gradient: true },
    { text: "visible", gradient: true },
  ];
  return (
    <h1 className="font-display mx-auto max-w-3xl text-4xl font-bold leading-tight text-slate-900 sm:text-6xl">
      {words.map((w, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.65, delay: 0.25 + i * 0.11, ease: [0.22, 1, 0.36, 1] }}
          className={`inline-block ${w.gradient ? "text-gradient" : ""}`}
        >
          {w.text}
          {i < words.length - 1 && <span>&nbsp;</span>}
        </motion.span>
      ))}
    </h1>
  );
}

export default function Landing({ activities, onStart, onDemo, hasData }: Props) {
  const total = activities.reduce((s, a) => s + a.co2, 0);

  // Mouse-driven parallax: background layers drift subtly toward the cursor,
  // smoothed with springs so the motion feels physical rather than 1:1.
  const heroRef = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });
  const blobX = useTransform(sx, (v) => v * 30);
  const blobY = useTransform(sy, (v) => v * 30);
  const blobX2 = useTransform(sx, (v) => v * -22);
  const blobY2 = useTransform(sy, (v) => v * -22);
  const emojiX = useTransform(sx, (v) => v * 14);
  const emojiY = useTransform(sy, (v) => v * 14);

  function handleMouseMove(e: React.MouseEvent) {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  return (
    <div className="overflow-hidden">
      <section ref={heroRef} onMouseMove={handleMouseMove} className="relative">
        {/* Layered ambient background: dot grid + parallax aurora blobs + leaves */}
        <div className="bg-dot-grid pointer-events-none absolute inset-0 -z-20" />
        <LeafParticles count={12} />
        <div className="pointer-events-none absolute inset-0 -z-10">
          <motion.div
            style={{ x: blobX, y: blobY }}
            className="animate-blob absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-200/50 blur-3xl"
          />
          <motion.div
            style={{ x: blobX2, y: blobY2 }}
            className="animate-blob-2 absolute top-20 right-0 h-80 w-80 rounded-full bg-teal-200/40 blur-3xl"
          />
          <motion.div
            style={{ x: blobX, y: blobY2 }}
            className="animate-aurora absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl"
          />
        </div>

        {/* Floating accents — desktop only, they crowd the copy on mobile */}
        <motion.div
          style={{ x: emojiX, y: emojiY }}
          className="pointer-events-none absolute inset-0 -z-0 hidden lg:block"
        >
          <span className="animate-float absolute left-[8%] top-24 text-4xl opacity-80">🌍</span>
          <span className="animate-float-slow absolute right-[10%] top-32 text-4xl opacity-80">🌱</span>
          <span className="animate-float absolute left-[15%] bottom-24 text-3xl opacity-70" style={{ animationDelay: "1s" }}>♻️</span>
          <span className="animate-float-slow absolute right-[18%] bottom-40 text-3xl opacity-70" style={{ animationDelay: "2s" }}>🍃</span>
          <span className="animate-float absolute right-[35%] top-16 text-2xl opacity-60" style={{ animationDelay: "0.5s" }}>☁️</span>
        </motion.div>

        <div className="mx-auto max-w-5xl px-4 pb-20 pt-16 text-center sm:pt-24">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div
              variants={fadeUp}
              className="glass mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 px-4 py-1.5 text-sm font-medium text-emerald-700 shadow-sm"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-pulse-ring absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              Climate Tech · Live carbon tracking
            </motion.div>

            <StaggeredHeadline />

            <motion.p variants={fadeUp} className="mx-auto mt-5 max-w-2xl text-lg text-slate-500">
              CarbonLens turns every{" "}
              <Typewriter
                words={["car trip", "meal", "kilowatt-hour", "bus ride", "flight"]}
                className="font-semibold text-emerald-600"
              />{" "}
              into a clear CO₂ number — so you can see your footprint, set a weekly budget, and
              actually shrink it.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Magnetic>
                <motion.button
                  onClick={onStart}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  className="btn-shine group relative rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-300/60"
                >
                  {hasData ? "Open my dashboard" : "Start tracking"}
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                </motion.button>
              </Magnetic>
              {!hasData && (
                <motion.button
                  onClick={onDemo}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  className="rounded-xl border border-slate-300 bg-white px-7 py-3.5 font-semibold text-slate-700 shadow-sm transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  ✨ Try with demo data
                </motion.button>
              )}
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4"
            >
              <HeroStat value={6} label="activity types" suffix="" />
              <HeroStat value={activities.length} label="entries you've logged" suffix="" />
              <HeroStat value={Math.round(total * 10) / 10} label="kg CO₂ tracked" decimals={1} />
              <HeroStat value={Math.round((total / 21) * 10) / 10} label="tree-years to absorb" decimals={1} />
            </motion.div>
          </motion.div>
        </div>

        {/* Emission-factor ticker — duplicated list for a seamless loop,
            pauses on hover, soft fade at both edges */}
        <div className="ticker-mask relative border-y border-slate-200 bg-white py-3">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
          <div className="flex overflow-hidden">
            <div className="animate-ticker flex shrink-0 items-center gap-10 whitespace-nowrap pr-10">
              {[...ACTIVITY_TYPES, ...ACTIVITY_TYPES].map((t, i) => {
                const m = ACTIVITY_META[t];
                return (
                  <span key={i} className="flex items-center gap-2 text-sm text-slate-500">
                    <span className="text-lg">{m.emoji}</span>
                    <span className="font-medium text-slate-700">{m.label}</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      {m.factor} kg/{m.unitShort}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-emerald-600">Features</span>
          <h2 className="font-display mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Everything you need to shrink your footprint
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {[
            { emoji: "📝", title: "One-tap logging", desc: "Pick an activity, enter a quantity, done. Live CO₂ preview before you even hit save." },
            { emoji: "🧮", title: "Transparent math", desc: "Fixed, published emission factors for every category. No black box — see exactly how each kg is computed." },
            { emoji: "📊", title: "Beautiful dashboard", desc: "Donut breakdowns, 14-day trends, and animated counters that make your data feel alive." },
            { emoji: "🎯", title: "Weekly CO₂ budget", desc: "Set a target, watch the pace marker, and get nudged before you blow the budget — never shamed." },
            { emoji: "🏅", title: "Achievements", desc: "Unlock badges for green streaks, veg meals, and bus rides. Progress should feel like a game." },
            { emoji: "🔍", title: "Filterable history", desc: "Slice your log by activity type and any date range. Your data, fully explorable." },
          ].map((f) => (
            <TiltCard key={f.title} emoji={f.emoji} title={f.title} desc={f.desc} />
          ))}
        </motion.div>
      </section>

      <section className="border-y border-slate-200 bg-gradient-to-b from-slate-50 to-white py-20">
        <div className="mx-auto max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <span className="text-sm font-bold uppercase tracking-widest text-emerald-600">How it works</span>
            <h2 className="font-display mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">Three steps to a lighter footprint</h2>
          </motion.div>

          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Connector line drawn between steps on desktop */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-[16%] right-[16%] top-14 hidden h-0.5 origin-left bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-300 md:block"
            />
            {[
              { step: "01", emoji: "✏️", title: "Log it", desc: "Drove 10 km? Had a chicken lunch? Log it in seconds — CarbonLens converts it to kg of CO₂ instantly." },
              { step: "02", emoji: "👀", title: "See it", desc: "Your dashboard shows totals, category breakdowns, and trends. Suddenly the invisible becomes visible." },
              { step: "03", emoji: "📉", title: "Shrink it", desc: "Set a weekly budget, follow the pace marker, swap car trips for bus rides, and watch the line bend down." },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.15 }}
                className="card card-lift relative p-7 text-center"
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-bold text-white shadow-md">
                  STEP {s.step}
                </div>
                <motion.div
                  whileHover={{ scale: 1.12, rotate: 6 }}
                  transition={{ type: "spring", stiffness: 320, damping: 14 }}
                  className="mx-auto mb-4 mt-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-3xl shadow-inner"
                >
                  {s.emoji}
                </motion.div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{s.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="animate-gradient-x relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 p-10 text-center text-white shadow-xl sm:p-14"
          >
            <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Why it matters</h2>
            <p className="mx-auto mt-3 max-w-xl text-emerald-50">
              The average person emits far more CO₂ than the planet can absorb. Seeing your
              numbers is the first step to changing them.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <ImpactStat value={4700} label="kg CO₂ — average person per year" />
              <ImpactStat value={2000} label="kg CO₂ — sustainable yearly budget" />
              <ImpactStat value={21} label="kg CO₂ one tree absorbs per year" />
            </div>
            <motion.button
              onClick={hasData ? onStart : onDemo}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 16 }}
              className="btn-shine mt-10 rounded-xl bg-white px-8 py-3.5 font-semibold text-emerald-700 shadow-lg hover:shadow-xl"
            >
              {hasData ? "Back to my dashboard →" : "See it in action →"}
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

/**
 * Feature card with a cursor-tracking 3D tilt. Rotation values run through
 * springs so the card settles smoothly instead of snapping back.
 */
function TiltCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 220, damping: 18 });
  const sry = useSpring(ry, { stiffness: 220, damping: 18 });

  function onMove(e: React.MouseEvent) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 10);
    rx.set(py * -10);
  }

  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div variants={fadeUp} style={{ perspective: 800 }}>
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
        className="card card-lift group h-full p-6"
      >
        <div
          style={{ transform: "translateZ(30px)" }}
          className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 text-2xl shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
        >
          {emoji}
        </div>
        <h3 style={{ transform: "translateZ(20px)" }} className="mb-1.5 font-semibold text-slate-900">
          {title}
        </h3>
        <p style={{ transform: "translateZ(10px)" }} className="text-sm leading-relaxed text-slate-500">
          {desc}
        </p>
      </motion.div>
    </motion.div>
  );
}

function HeroStat({
  value,
  label,
  suffix = "",
  decimals = 0,
}: {
  value: number;
  label: string;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <SpotlightCard className="glass rounded-2xl border border-slate-200/80 p-4 shadow-sm">
        <div className="font-display text-2xl font-bold text-slate-900">
          <AnimatedNumber value={value} decimals={decimals} suffix={suffix} duration={1400} />
        </div>
        <div className="mt-0.5 text-xs text-slate-400">{label}</div>
      </SpotlightCard>
    </motion.div>
  );
}

function ImpactStat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-4xl font-extrabold">
        <AnimatedNumber value={value} duration={1600} />
      </div>
      <div className="mt-1 text-sm text-emerald-100">{label}</div>
    </div>
  );
}
