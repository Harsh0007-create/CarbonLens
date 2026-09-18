import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

interface Props {
  /** 0–100+ percentage of the weekly budget consumed */
  percent: number;
  label: string;
}

// Semicircular gauge geometry
const CX = 100;
const CY = 96;
const R = 76;

function polar(angleDeg: number, radius = R) {
  const rad = ((angleDeg - 180) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function arcPath(startAngle: number, endAngle: number) {
  const s = polar(startAngle);
  const e = polar(endAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${R} ${R} 0 ${large} 1 ${e.x} ${e.y}`;
}

/**
 * Animated "CO₂ speedometer" for the weekly budget. The needle is driven by
 * a spring so it swings and settles physically; the colored zones map to the
 * green / amber / red nudge tiers.
 */
export default function Gauge({ percent, label }: Props) {
  const clamped = Math.min(Math.max(percent, 0), 130);

  // Needle spring: 0% → 0°, 130% → 180° sweep
  const spring = useSpring(0, { stiffness: 55, damping: 13, mass: 0.8 });
  useEffect(() => {
    spring.set((clamped / 130) * 180);
  }, [clamped, spring]);
  const needleRotation = useTransform(spring, (deg) => deg - 90);

  const over = percent > 100;
  const warn = percent > 70 && !over;
  const valueColor = over ? "#dc2626" : warn ? "#d97706" : "#059669";

  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 200 112" className="w-full max-w-[240px]">
        {/* Track */}
        <path d={arcPath(0, 180)} fill="none" stroke="#f1f5f9" strokeWidth={13} strokeLinecap="round" />

        {/* Colored zones: green 0–70%, amber 70–100%, red 100–130% */}
        <path d={arcPath(0, 96)} fill="none" stroke="#10b981" strokeWidth={13} strokeLinecap="round" opacity={0.85} />
        <path d={arcPath(98, 137)} fill="none" stroke="#f59e0b" strokeWidth={13} strokeLinecap="round" opacity={0.85} />
        <path d={arcPath(139, 180)} fill="none" stroke="#ef4444" strokeWidth={13} strokeLinecap="round" opacity={0.85} />

        {/* Tick marks */}
        {[0, 45, 90, 135, 180].map((a) => {
          const p1 = polar(a, R - 14);
          const p2 = polar(a, R - 20);
          return <line key={a} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#cbd5e1" strokeWidth={2} strokeLinecap="round" />;
        })}

        {/* Needle — rotates around the hub with spring physics */}
        <motion.g style={{ rotate: needleRotation, originX: "100px", originY: "96px" }}>
          <path d="M 100 96 L 96.5 90 L 100 34 L 103.5 90 Z" fill="#0f172a" />
          <circle cx={100} cy={96} r={7} fill="#0f172a" />
          <circle cx={100} cy={96} r={3} fill="#fff" />
        </motion.g>
      </svg>

      <div className="-mt-3 text-center">
        <motion.div
          key={Math.round(percent)}
          initial={{ scale: 0.9, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="font-display text-2xl font-bold"
          style={{ color: valueColor }}
        >
          {Math.round(percent)}%
        </motion.div>
        <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</div>
      </div>
    </div>
  );
}
