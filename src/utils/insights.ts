// Insight engine — pattern detection and human-friendly messages.
// Pure functions, no AI calls. Easy to explain in a viva.

import { Entry, Tag } from "@/types";
import { differenceInCalendarDays, parseISO } from "date-fns";

export interface Insight {
  tone: "positive" | "warning" | "neutral" | "info";
  title: string;
  message: string;
}

const avg = (xs: number[]) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
const energyScore = (e: Entry) => e.energy === "high" ? 3 : e.energy === "medium" ? 2 : 1;

function recent(entries: Entry[], days: number): Entry[] {
  const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days);
  return entries.filter(e => parseISO(e.date) >= cutoff);
}

export function streak(entries: Entry[]): number {
  if (!entries.length) return 0;
  const dates = new Set(entries.map(e => e.date));
  let s = 0; const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (dates.has(key)) s++; else break;
  }
  return s;
}

export function trend(entries: Entry[]): "improving" | "declining" | "stable" | "unknown" {
  const last7 = recent(entries, 7);
  if (last7.length < 3) return "unknown";
  const first = avg(last7.slice(Math.floor(last7.length / 2)).map(e => e.mood));
  const second = avg(last7.slice(0, Math.floor(last7.length / 2)).map(e => e.mood));
  const diff = second - first;
  if (diff > 0.4) return "improving";
  if (diff < -0.4) return "declining";
  return "stable";
}

export function currentState(entry?: Entry): string {
  if (!entry) return "Not logged yet";
  if (entry.stress >= 4 && entry.mood <= 2) return "Overwhelmed";
  if (entry.stress >= 4) return "Highly stressed";
  if (entry.mood >= 4 && entry.energy === "high") return "Thriving";
  if (entry.mood >= 4) return "Feeling good";
  if (entry.mood === 3) return "Steady";
  if (entry.energy === "low") return "Low energy";
  return "A little low";
}

// Tag-correlation: average mood when a tag is present vs not.
export function tagCorrelations(entries: Entry[]): { tag: Tag; deltaMood: number; count: number }[] {
  const tags = Array.from(new Set(entries.flatMap(e => e.tags))) as Tag[];
  return tags.map(tag => {
    const withT = entries.filter(e => e.tags.includes(tag));
    const without = entries.filter(e => !e.tags.includes(tag));
    return {
      tag,
      deltaMood: avg(withT.map(e => e.mood)) - avg(without.map(e => e.mood)),
      count: withT.length,
    };
  }).sort((a, b) => Math.abs(b.deltaMood) - Math.abs(a.deltaMood));
}

const POSITIVE_LOW_MOOD = [
  "It looks like today has been a bit heavy. Try to be gentle with yourself.",
  "A low day is just one data point — tomorrow is a fresh start.",
  "You've had a few low days — maybe it's time to pause and recharge.",
];
const HIGH_STRESS = [
  "Your stress levels are high today. A short walk or breathing break might help reset things.",
  "You've been pushing yourself hard lately — consider slowing down a notch.",
  "Stress has crept up this week. Try a 5-minute breathing pause.",
];
const POSITIVE_TREND = [
  "You've been improving over the last few days — that's real progress.",
  "Nice rhythm! Your mood has been trending upward. Keep this momentum.",
  "You're doing better than yesterday. Keep going.",
];
const STABLE = [
  "You're showing up consistently — that itself is a win.",
  "Steady week. Consistency builds resilience.",
];
const ENCOURAGE_LOG = [
  "You haven't logged today yet. A 30-second check-in helps reveal patterns.",
  "Tap +Log to capture how today felt — even a quick rating counts.",
];

const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

export function generateInsights(entries: Entry[], today: string): Insight[] {
  const out: Insight[] = [];
  const todayEntry = entries.find(e => e.date === today);
  const last7 = recent(entries, 7);
  const last3 = recent(entries, 3);

  if (!todayEntry) {
    out.push({ tone: "info", title: "Quick check-in", message: pick(ENCOURAGE_LOG) });
  } else {
    if (todayEntry.mood <= 2) out.push({ tone: "warning", title: "Tough day", message: pick(POSITIVE_LOW_MOOD) });
    if (todayEntry.stress >= 4) out.push({ tone: "warning", title: "High stress", message: pick(HIGH_STRESS) });
    if (todayEntry.mood >= 4 && todayEntry.energy !== "low")
      out.push({ tone: "positive", title: "Looking good", message: "You're in a strong spot today — savor it and notice what's working." });
  }

  // 3-day low streak
  if (last3.length >= 3 && last3.every(e => e.mood <= 2)) {
    out.push({ tone: "warning", title: "Pattern: low streak", message: "You've had 3 low-mood days in a row. Consider talking to someone you trust, or schedule a real break." });
  }

  // Trend
  const t = trend(entries);
  if (t === "improving") out.push({ tone: "positive", title: "Trending up", message: pick(POSITIVE_TREND) });
  else if (t === "stable" && last7.length >= 4) out.push({ tone: "neutral", title: "Steady", message: pick(STABLE) });

  // Tag correlations
  const tags = tagCorrelations(last7.length >= 5 ? last7 : entries).filter(t => t.count >= 3);
  const best = tags.find(t => t.deltaMood >= 0.6);
  const worst = tags.find(t => t.deltaMood <= -0.6);
  if (best) out.push({ tone: "positive", title: `${best.tag} helps`, message: `Your mood is noticeably better on days tagged "${best.tag}". Lean into it.` });
  if (worst) out.push({ tone: "info", title: `${worst.tag} drags`, message: `Days with "${worst.tag}" tend to feel heavier. Worth noticing — not avoiding.` });

  // Stress vs study correlation specifically
  const study = entries.filter(e => e.tags.includes("study"));
  if (study.length >= 4) {
    const studyStress = avg(study.map(e => e.stress));
    const otherStress = avg(entries.filter(e => !e.tags.includes("study")).map(e => e.stress));
    if (studyStress - otherStress > 0.7)
      out.push({ tone: "info", title: "Study load", message: "You tend to feel more stressed on heavy study days. Building short breaks might help." });
  }

  // Sleep & energy
  const lowSleep = entries.filter(e => !e.tags.includes("sleep"));
  if (lowSleep.length >= 4 && avg(lowSleep.map(energyScore)) < 1.7)
    out.push({ tone: "info", title: "Sleep pattern", message: "Low-energy days often align with poor sleep. Rest might be key this week." });

  return out.slice(0, 4);
}

export interface Suggestion { category: "calm" | "focus" | "energy"; title: string; detail: string; }

export function generateSuggestions(entry?: Entry): Suggestion[] {
  if (!entry) return [
    { category: "calm", title: "Box breathing 4-4-4-4", detail: "60 seconds. Inhale, hold, exhale, hold." },
    { category: "focus", title: "One small task", detail: "Pick the smallest next step and do just that." },
  ];
  const out: Suggestion[] = [];
  if (entry.stress >= 4 || entry.mood <= 2) {
    out.push({ category: "calm", title: "5-minute breathing", detail: "Slow inhale 4s, exhale 6s. Repeat 8 times." });
    out.push({ category: "calm", title: "Step outside", detail: "A short walk shifts your nervous system." });
  }
  if (entry.energy === "low") {
    out.push({ category: "energy", title: "Light stretching", detail: "2 minutes of neck and shoulder rolls." });
    out.push({ category: "energy", title: "Hydrate + sunlight", detail: "Glass of water near a window for 5 minutes." });
  }
  if (entry.tags.includes("study") || entry.tags.includes("exam")) {
    out.push({ category: "focus", title: "Pomodoro 25/5", detail: "25 minutes focus, 5 minutes complete rest." });
    out.push({ category: "focus", title: "Task breakdown", detail: "Split the next chapter into 3 micro-steps." });
  }
  if (entry.mood >= 4) {
    out.push({ category: "focus", title: "Ride the momentum", detail: "Tackle the thing you've been putting off." });
  }
  return out.slice(0, 4);
}

export function smartAlerts(entries: Entry[], today: string): string[] {
  const alerts: string[] = [];
  if (!entries.find(e => e.date === today)) alerts.push("You haven't logged your mood today.");
  const last3 = recent(entries, 3);
  if (last3.length >= 3 && last3.every(e => e.mood <= 2))
    alerts.push("You've had low mood for 3 consecutive days.");
  const last7 = recent(entries, 7);
  if (last7.length >= 4 && avg(last7.map(e => e.stress)) >= 4)
    alerts.push("Your stress levels have been high this week.");
  return alerts;
}

export function lastLoggedAgo(entries: Entry[]): number | null {
  if (!entries.length) return null;
  const latest = entries[0];
  return differenceInCalendarDays(new Date(), parseISO(latest.date));
}
