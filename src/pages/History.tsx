import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { useEntries } from "@/context/EntriesContext";
import { MOOD_META, TAG_OPTIONS, Tag } from "@/types";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const History = () => {
  const { entries } = useEntries();
  const [moodFilter, setMoodFilter] = useState<number | null>(null);
  const [tagFilter, setTagFilter] = useState<Tag | null>(null);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (moodFilter && e.mood !== moodFilter) return false;
      if (tagFilter && !e.tags.includes(tagFilter)) return false;
      if (q && !(e.notes ?? "").toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [entries, moodFilter, tagFilter, q]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">History</h1>
        <p className="mt-1 text-sm text-muted-foreground">{entries.length} entr{entries.length === 1 ? "y" : "ies"} so far.</p>
      </header>

      <div className="glass-card space-y-4 p-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search notes..."
            className="rounded-2xl bg-white/70 pl-10" />
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mood</p>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(v => (
              <button key={v} onClick={() => setMoodFilter(moodFilter === v ? null : v)}
                className={cn("flex h-10 w-10 items-center justify-center rounded-2xl text-lg transition-all",
                  moodFilter === v ? "bg-primary/20 ring-2 ring-primary" : "bg-white/60")}>
                {MOOD_META[v].emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tag</p>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map(t => (
              <button key={t} onClick={() => setTagFilter(tagFilter === t ? null : t)}
                className={cn("rounded-full px-3 py-1 text-xs font-medium transition-all",
                  tagFilter === t ? "bg-gradient-bloom text-white" : "bg-white/70 text-muted-foreground")}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-sm text-muted-foreground">No entries match your filters.</p>
          <Link to="/app/log" className="mt-3 inline-flex text-sm font-semibold text-primary">Log one now</Link>
        </div>
      ) : (
        <div className="grid gap-2">
          {filtered.map(e => (
            <Link key={e.id} to={`/app/log?date=${e.date}`}
              className="glass-card flex items-center gap-4 p-4 transition-all hover:shadow-glow">
              <span className="text-3xl">{MOOD_META[e.mood].emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{format(parseISO(e.date), "EEEE, MMM d, yyyy")}</p>
                <p className="text-xs text-muted-foreground">
                  Stress {e.stress}/5 · Energy {e.energy}
                </p>
                {e.tags.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {e.tags.map(t => <Badge key={t} variant="secondary" className="rounded-full text-[10px]">{t}</Badge>)}
                  </div>
                )}
                {e.notes && <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">"{e.notes}"</p>}
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
