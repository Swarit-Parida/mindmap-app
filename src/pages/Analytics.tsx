import { useMemo } from "react";
import { useEntries } from "@/context/EntriesContext";
import { format, parseISO, subDays, eachDayOfInterval } from "date-fns";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from "recharts";
import { tagCorrelations } from "@/utils/insights";
import { MOOD_META } from "@/types";

const COLORS = [
  "hsl(199 89% 64%)",
  "hsl(6 93% 75%)",
  "hsl(199 70% 50%)",
  "hsl(12 90% 70%)",
  "hsl(280 60% 70%)",
  "hsl(150 50% 60%)",
  "hsl(40 90% 65%)",
  "hsl(220 60% 70%)",
  "hsl(340 70% 70%)",
  "hsl(170 60% 55%)",
];

const Analytics = () => {
  const { entries } = useEntries();

  // Mood vs Stress over the last 30 days — fill missing days with null so the
  // chart doesn't jump weirdly. Sort ascending for left→right time axis.
  const trendSeries = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
    const map = new Map(entries.map(e => [e.date, e]));
    return days.map(d => {
      const key = format(d, "yyyy-MM-dd");
      const e = map.get(key);
      return {
        date: format(d, "MMM d"),
        mood: e ? e.mood : null,
        stress: e ? e.stress : null,
      };
    });
  }, [entries]);

  // Stress distribution
  const stressDist = useMemo(() => {
    const counts = [1,2,3,4,5].map(v => ({ level: `${v}`, count: 0 }));
    entries.forEach(e => { counts[e.stress - 1].count += 1; });
    return counts;
  }, [entries]);

  // Tag frequency
  const tagFreq = useMemo(() => {
    const m = new Map<string, number>();
    entries.forEach(e => e.tags.forEach(t => m.set(t, (m.get(t) ?? 0) + 1)));
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [entries]);

  // Mood distribution (emoji)
  const moodDist = useMemo(() => {
    const counts = [1,2,3,4,5].map(v => ({
      mood: MOOD_META[v].emoji, label: MOOD_META[v].label, count: 0,
    }));
    entries.forEach(e => { counts[e.mood - 1].count += 1; });
    return counts;
  }, [entries]);

  const correlations = useMemo(() => tagCorrelations(entries).slice(0, 6), [entries]);
  const hasData = entries.length > 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Insights & Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Patterns from your last 30 days of check-ins.
        </p>
      </header>

      {!hasData ? (
        <div className="glass-card p-10 text-center text-sm text-muted-foreground">
          Log a few days to start seeing your patterns appear here.
        </div>
      ) : (
        <>
          <section className="glass-card p-5">
            <h2 className="font-display text-lg font-bold">Mood vs Stress (last 30 days)</h2>
            <p className="text-xs text-muted-foreground">Higher mood = better. Higher stress = more pressure.</p>
            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} interval="preserveStartEnd" />
                  <YAxis domain={[1, 5]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(v: any) => v ?? "—"}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="mood" name="Mood"
                    stroke="hsl(199 89% 58%)" strokeWidth={2.5}
                    dot={{ r: 3, fill: "hsl(199 89% 58%)" }} activeDot={{ r: 5 }}
                    connectNulls
                  />
                  <Line type="monotone" dataKey="stress" name="Stress"
                    stroke="hsl(6 93% 70%)" strokeWidth={2.5}
                    dot={{ r: 3, fill: "hsl(6 93% 70%)" }} activeDot={{ r: 5 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="glass-card p-5">
              <h2 className="font-display text-lg font-bold">Stress distribution</h2>
              <p className="text-xs text-muted-foreground">How often each stress level shows up.</p>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stressDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="level" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                    <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="hsl(6 93% 75%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="glass-card p-5">
              <h2 className="font-display text-lg font-bold">Mood distribution</h2>
              <p className="text-xs text-muted-foreground">Your emotional spread.</p>
              <div className="mt-4 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moodDist} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="mood" tick={{ fontSize: 16 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                    <Bar dataKey="count" radius={[10, 10, 0, 0]} fill="hsl(199 89% 64%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {tagFreq.length > 0 && (
            <section className="glass-card p-5">
              <h2 className="font-display text-lg font-bold">Tag frequency</h2>
              <p className="text-xs text-muted-foreground">What your days are made of.</p>
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={tagFreq} dataKey="value" nameKey="name" cx="50%" cy="50%"
                      outerRadius={90} innerRadius={45} paddingAngle={2}>
                      {tagFreq.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {correlations.length > 0 && (
            <section className="glass-card p-5">
              <h2 className="font-display text-lg font-bold">Tag impact on mood</h2>
              <p className="text-xs text-muted-foreground">Average mood difference on days with each tag vs without.</p>
              <ul className="mt-4 space-y-2.5">
                {correlations.map(c => {
                  const positive = c.deltaMood >= 0;
                  const pct = Math.min(100, Math.abs(c.deltaMood) * 50);
                  return (
                    <li key={c.tag} className="flex items-center gap-3">
                      <span className="w-24 shrink-0 text-sm font-medium capitalize">{c.tag}</span>
                      <div className="relative h-6 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={positive ? "absolute left-1/2 top-0 h-full bg-gradient-sky" : "absolute right-1/2 top-0 h-full bg-gradient-peach"}
                          style={{ width: `${pct / 2}%` }}
                        />
                        <div className="absolute left-1/2 top-0 h-full w-px bg-foreground/20" />
                      </div>
                      <span className={`w-12 shrink-0 text-right text-xs font-semibold ${positive ? "text-primary" : "text-secondary-foreground"}`}>
                        {positive ? "+" : ""}{c.deltaMood.toFixed(2)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;
