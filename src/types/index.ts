export type EnergyLevel = "low" | "medium" | "high";

export const TAG_OPTIONS = [
  "study",
  "sleep",
  "social",
  "health",
  "family",
  "exercise",
  "exam",
  "work",
  "creative",
  "screen-time",
] as const;

export type Tag = typeof TAG_OPTIONS[number];

export interface Entry {
  id: string;
  userId: string;
  date: string;        // ISO yyyy-MM-dd (the day the entry is FOR)
  mood: number;        // 1..5 (1 awful, 5 great)
  stress: number;      // 1..5
  energy: EnergyLevel;
  tags: Tag[];
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppUser {
  uid: string;
  email: string;
  name: string;
}

export const MOOD_META: Record<number, { emoji: string; label: string; color: string }> = {
  1: { emoji: "😞", label: "Awful", color: "hsl(var(--destructive))" },
  2: { emoji: "😕", label: "Low", color: "hsl(var(--peach))" },
  3: { emoji: "😐", label: "Okay", color: "hsl(var(--muted-foreground))" },
  4: { emoji: "🙂", label: "Good", color: "hsl(var(--primary))" },
  5: { emoji: "😄", label: "Great", color: "hsl(var(--success))" },
};
