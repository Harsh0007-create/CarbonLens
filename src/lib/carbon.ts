export type ActivityType =
  | "car"
  | "bus"
  | "flight"
  | "electricity"
  | "veg_meal"
  | "nonveg_meal";

export interface Activity {
  id: string;
  type: ActivityType;
  quantity: number;
  co2: number; // kg
  date: string; // yyyy-mm-dd
  note?: string;
  createdAt: number;
}

export interface ActivityMeta {
  label: string;
  unit: string;
  unitShort: string;
  factor: number; // kg CO2 per unit, fixed values from the brief
  emoji: string;
  color: string;
  sanityMax: number; // anything above this gets the "are you sure?" treatment
  quantityLabel: string;
}

export const ACTIVITY_META: Record<ActivityType, ActivityMeta> = {
  car: {
    label: "Car travel",
    unit: "kilometres",
    unitShort: "km",
    factor: 0.2,
    emoji: "🚗",
    color: "#ef4444",
    sanityMax: 2000,
    quantityLabel: "Distance",
  },
  bus: {
    label: "Bus travel",
    unit: "kilometres",
    unitShort: "km",
    factor: 0.08,
    emoji: "🚌",
    color: "#f59e0b",
    sanityMax: 2000,
    quantityLabel: "Distance",
  },
  flight: {
    label: "Flight",
    unit: "kilometres",
    unitShort: "km",
    factor: 0.25,
    emoji: "✈️",
    color: "#8b5cf6",
    sanityMax: 20000,
    quantityLabel: "Distance",
  },
  electricity: {
    label: "Electricity",
    unit: "kilowatt-hours",
    unitShort: "kWh",
    factor: 0.8,
    emoji: "⚡",
    color: "#0ea5e9",
    sanityMax: 500,
    quantityLabel: "Energy used",
  },
  veg_meal: {
    label: "Veg meal",
    unit: "meals",
    unitShort: "meal",
    factor: 0.5,
    emoji: "🥗",
    color: "#10b981",
    sanityMax: 10,
    quantityLabel: "Number of meals",
  },
  nonveg_meal: {
    label: "Non-veg meal",
    unit: "meals",
    unitShort: "meal",
    factor: 2.0,
    emoji: "🍗",
    color: "#f97316",
    sanityMax: 10,
    quantityLabel: "Number of meals",
  },
};

export const ACTIVITY_TYPES = Object.keys(ACTIVITY_META) as ActivityType[];

export function calcCO2(type: ActivityType, quantity: number): number {
  return Math.round(ACTIVITY_META[type].factor * quantity * 1000) / 1000;
}

/** Formats a kg value for display, switching to tonnes above 1000 kg. */
export function fmtKg(kg: number): string {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} t`;
  if (kg >= 100) return `${kg.toFixed(0)} kg`;
  return `${kg.toFixed(kg < 10 ? 2 : 1)} kg`;
}

// ---- Date & week helpers (ISO weeks, Monday start — see DECISIONS.md) ----

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Returns the Monday of the week containing `d` (getDay() is 0 on Sunday). */
export function weekStart(d: Date): Date {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = copy.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + diff);
  return copy;
}

export function weekEnd(d: Date): Date {
  const start = weekStart(d);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

export function isInCurrentWeek(iso: string): boolean {
  const d = parseISO(iso);
  const start = weekStart(new Date());
  const end = weekEnd(new Date());
  return d >= start && d <= end;
}

/** Day of week as 1..7 with Monday = 1. */
export function dayOfWeekMon(d: Date): number {
  const dow = d.getDay();
  return dow === 0 ? 7 : dow;
}

export function fmtDate(iso: string): string {
  return parseISO(iso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function fmtDateShort(iso: string): string {
  return parseISO(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

// ---- Persistence (localStorage, versioned keys for future migrations) ----

const ACT_KEY = "cft_activities_v1";
const TARGET_KEY = "cft_weekly_target_v1";
const TOUR_KEY = "cft_tour_seen_v1";

export function loadTourSeen(): boolean {
  try {
    return localStorage.getItem(TOUR_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveTourSeen() {
  try {
    localStorage.setItem(TOUR_KEY, "1");
  } catch {
    // ignore
  }
}

export function loadActivities(): Activity[] {
  try {
    const raw = localStorage.getItem(ACT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveActivities(list: Activity[]) {
  localStorage.setItem(ACT_KEY, JSON.stringify(list));
}

export function loadTarget(): number {
  try {
    const raw = localStorage.getItem(TARGET_KEY);
    const n = raw ? Number(raw) : NaN;
    // 50kg/week default - roughly what an average commuter racks up
    return Number.isFinite(n) && n > 0 ? n : 50;
  } catch {
    return 50;
  }
}

export function saveTarget(t: number) {
  localStorage.setItem(TARGET_KEY, String(t));
}

/** Lightweight unique ID — sufficient for a client-side data set. */
export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/**
 * Real-world equivalents that make a kg figure tangible.
 * Basis: ~21 kg CO₂ absorbed per tree per year, ~0.021 kg per phone charge.
 */
export function equivalents(kg: number): string[] {
  return [
    `${Math.round(kg / 0.021)} smartphone charges`,
    `${(kg / 21).toFixed(1)} trees needed for a year to absorb this`,
    `${(kg / 0.2).toFixed(0)} km of average car driving`,
  ];
}
