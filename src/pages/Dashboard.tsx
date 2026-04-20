import { useMemo } from "react";
import { Link } from "react-router-dom";
import { format, addDays, startOfWeek, isToday, parseISO } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { useEntries } from "@/context/EntriesContext";
import { CircularProgress } from "@/components/CircularProgress";
import { MOOD_META } from "@/types";
import {
  generateInsights, generateSuggestions, smartAlerts, streak, trend, currentState,
} from "@/utils/insights";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bell, Plus, Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const trendIcon = { improving: TrendingUp, declining: TrendingDown, stable: Minus, unknown: Minus };
const toneStyle: Record<string, string> = {
  positive: "bg-gradient-sky",
  warning: "bg-gradient-peach",
  neutral: "bg-white/70",
  info: "bg-white/70",
};

const Dashboard = () => {
  const { user } = useAuth();
  const { entries } = useEntries();
  const today = format(new Date(), "yyyy-MM-dd");

  const todayEntry = useMemo(() => entries.find(e => e.date === today), [entries, today]);
  const weekDays = useMemo(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, []);
  const insights = useMemo(() => generateInsights(entries, today), [entries, today]);
  const suggestions = useMemo(() => generateSuggestions(todayEntry), [todayEntry]);
  const alerts = useMemo(() => smartAlerts(entries, today), [entries, today]);
  const s = streak(entries);
  const t = trend(entries);
  const TIcon = trendIcon[t];
  const dailyProgress = todayEntry ? 100 : 0;
  const weekLogged = weekDays.filter(d => entries.some(e => e.date === format(d, "yyyy-MM-dd"))).length;
  const weekProgress = (weekLogged / 7) * 100;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <header className="flex items-end justify-between gap-4 animate-fade-in">
        <div>
          <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM d")}</p>
          <h1 className="font-display text-3xl font-bold md:text-4xl">
            Hi, {user?.name?.split(" ")[0] || "friend"} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Current state: <span className="font-semibold text-foreground">{currentState(todayEntry)}</span>
          </p>
        </div>
        <Link to="/app/log">
          <Button className="rounded-2xl bg-gradient-bloom text-white shadow-glow">
            <Plus className="mr-1 h-4 w-4" /> Log
          </Button>
        </Link>
      </header>

      {/* Week timeline */}
      <div className="glass-card p-4 animate-slide-up">
        <div className="flex items-center justify-between gap-2">
          {weekDays.map(d => {
            const key = format(d, "yyyy-MM-dd");
            const e = entries.find(x => x.date === key);
            const isFuture = d > new Date();
            return (
              <Link
                key={key}
                to={isFuture ? "#" : `/app/log?date=${key}`}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-center transition-all",
                  isToday(d) && "bg-white shadow-soft",
                  isFuture && "pointer-events-none opacity-40"
                )}
              >
                <span className="text-[10px] font-medium uppercase text-muted-foreground">{format(d, "EEE")}</span>
                <span className="text-sm font-bold">{format(d, "d")}</span>
                <span className="text-base leading-none">{e ? MOOD_META[e.mood].emoji : "·"}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Top stats */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass-card flex items-center justify-between p-5 animate-slide-up">
          <CircularProgress
            value={dailyProgress}
            size={110}
            label={todayEntry ? "✓" : "0"}
            sublabel="today"
            gradient="bloom"
          />
          <div className="flex-1 pl-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Today</p>
            <p className="font-display text-xl font-bold">
              {todayEntry ? `${MOOD_META[todayEntry.mood].emoji} ${MOOD_META[todayEntry.mood].label}` : "Not logged"}
            </p>
            {!todayEntry && (
              <Link to="/app/log" className="mt-2 inline-flex text-xs font-semibold text-primary">
                Log now <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            )}
          </div>
        </div>

        <div className="glass-card flex items-center justify-between p-5 animate-slide-up">
          <CircularProgress value={weekProgress} size={110} label={`${weekLogged}/7`} sublabel="this week" gradient="sky" />
          <div className="flex-1 pl-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Week goal</p>
            <p className="font-display text-xl font-bold">{Math.round(weekProgress)}%</p>
            <p className="text-xs text-muted-foreground">days logged</p>
          </div>
        </div>

        <div className="glass-card flex items-center justify-between p-5 animate-slide-up">
          <div className="grid h-[110px] w-[110px] place-items-center rounded-full bg-gradient-peach shadow-peach">
            <span className="font-display text-4xl font-extrabold text-white">{s}</span>
          </div>
          <div className="flex-1 pl-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Streak</p>
            <p className="font-display text-xl font-bold">{s} day{s === 1 ? "" : "s"}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <TIcon className="h-3 w-3" /> trend {t}
            </p>
          </div>
        </div>
      </section>

      {/* Alerts */}
      {alerts.length > 0 && (
        <section className="space-y-2">
          {alerts.map((a, i) => (
            <div key={i} className="glass-card flex items-center gap-3 bg-gradient-peach/60 p-4">
              <Bell className="h-4 w-4 shrink-0 text-secondary-foreground" />
              <p className="text-sm font-medium">{a}</p>
            </div>
          ))}
        </section>
      )}

      {/* Insights */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-bold">Insights for you</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {insights.map((ins, i) => (
            <div key={i} className={cn("glass-card p-5", toneStyle[ins.tone])}>
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground/60">{ins.title}</p>
              <p className="mt-1.5 text-sm font-medium leading-relaxed text-foreground/90">{ins.message}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-bold">Try one of these</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {suggestions.map((s, i) => (
              <div key={i} className="glass-card flex items-start gap-3 p-4">
                <span className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-2xl text-lg",
                  s.category === "calm" && "bg-gradient-sky",
                  s.category === "focus" && "bg-gradient-bloom",
                  s.category === "energy" && "bg-gradient-peach",
                )}>
                  {s.category === "calm" ? "🧘" : s.category === "focus" ? "🎯" : "⚡"}
                </span>
                <div>
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent */}
      {entries.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Recent entries</h2>
            <Link to="/app/history" className="text-xs font-semibold text-primary">See all</Link>
          </div>
          <div className="grid gap-2">
            {entries.slice(0, 4).map(e => (
              <Link key={e.id} to={`/app/log?date=${e.date}`}
                className="glass-card flex items-center gap-4 p-4 transition-all hover:shadow-glow">
                <span className="text-2xl">{MOOD_META[e.mood].emoji}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{format(parseISO(e.date), "EEE, MMM d")}</p>
                  <p className="text-xs text-muted-foreground">
                    Stress {e.stress}/5 · Energy {e.energy}{e.tags.length ? ` · ${e.tags.slice(0, 3).join(", ")}` : ""}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
