import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Entry, MOOD_META, TAG_OPTIONS, Tag, EnergyLevel } from "@/types";
import { useEntries } from "@/context/EntriesContext";
import { toast } from "sonner";

interface Props {
  initialDate?: string;
  onSaved?: (entry: Entry) => void;
}

const energyOptions: { value: EnergyLevel; label: string; emoji: string }[] = [
  { value: "low", label: "Low", emoji: "🪫" },
  { value: "medium", label: "Medium", emoji: "🔋" },
  { value: "high", label: "High", emoji: "⚡" },
];

export const EntryForm = ({ initialDate, onSaved }: Props) => {
  const { upsert, remove, getByDate } = useEntries();
  const [date, setDate] = useState<Date>(
    initialDate ? new Date(initialDate + "T00:00:00") : new Date()
  );
  const [mood, setMood] = useState(3);
  const [stress, setStress] = useState(3);
  const [energy, setEnergy] = useState<EnergyLevel>("medium");
  const [tags, setTags] = useState<Tag[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const dateKey = format(date, "yyyy-MM-dd");
  const existing = getByDate(dateKey);

  // Hydrate when an entry exists for the chosen date.
  useEffect(() => {
    if (existing) {
      setMood(existing.mood);
      setStress(existing.stress);
      setEnergy(existing.energy);
      setTags(existing.tags);
      setNotes(existing.notes ?? "");
    } else {
      setMood(3); setStress(3); setEnergy("medium"); setTags([]); setNotes("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey, existing?.id]);

  const toggleTag = (t: Tag) =>
    setTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const e = await upsert({ date: dateKey, mood, stress, energy, tags, notes: notes.trim() || undefined });
      toast.success(existing ? "Entry updated" : "Entry saved");
      onSaved?.(e);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save");
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!existing) return;
    await remove(existing.id);
    toast.success("Entry deleted");
  };

  return (
    <div className="space-y-6">
      {/* Date picker */}
      <div className="glass-card p-5">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Entry date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="mt-2 w-full justify-start rounded-2xl bg-white/70 text-left font-medium">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(date, "EEEE, MMM d, yyyy")}
              {existing && <Badge variant="secondary" className="ml-auto">Editing</Badge>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 z-50" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              disabled={(d) => d > new Date()}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        <p className="mt-2 text-xs text-muted-foreground">
          Pick any past date or today — entries can be backfilled and updated later.
        </p>
      </div>

      {/* Mood */}
      <div className="glass-card p-5">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">How was your mood?</label>
        <div className="mt-4 flex items-center justify-between gap-2">
          {[1, 2, 3, 4, 5].map(v => (
            <button
              key={v} type="button" onClick={() => setMood(v)}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-2xl border-2 py-3 transition-all",
                mood === v
                  ? "border-primary bg-primary/10 scale-105"
                  : "border-transparent bg-white/50 hover:bg-white/80"
              )}
            >
              <span className="text-2xl">{MOOD_META[v].emoji}</span>
              <span className="text-[10px] font-medium text-muted-foreground">{MOOD_META[v].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stress */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stress level</label>
          <span className="font-display text-2xl font-bold">{stress}<span className="text-sm text-muted-foreground">/5</span></span>
        </div>
        <Slider className="mt-4" min={1} max={5} step={1} value={[stress]} onValueChange={(v) => setStress(v[0])} />
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>Calm</span><span>Overwhelmed</span>
        </div>
      </div>

      {/* Energy */}
      <div className="glass-card p-5">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Energy</label>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {energyOptions.map(opt => (
            <button
              key={opt.value} type="button" onClick={() => setEnergy(opt.value)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border-2 py-3 text-sm font-medium transition-all",
                energy === opt.value
                  ? "border-primary bg-primary/10"
                  : "border-transparent bg-white/50 hover:bg-white/80"
              )}
            >
              <span className="text-lg">{opt.emoji}</span>{opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="glass-card p-5">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">What was today about?</label>
        <div className="mt-3 flex flex-wrap gap-2">
          {TAG_OPTIONS.map(t => {
            const active = tags.includes(t);
            return (
              <button
                key={t} type="button" onClick={() => toggleTag(t)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                  active
                    ? "bg-gradient-bloom text-white shadow-soft"
                    : "bg-white/70 text-muted-foreground hover:bg-white"
                )}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="glass-card p-5">
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notes (optional)</label>
        <Textarea
          className="mt-3 rounded-2xl border-white/60 bg-white/70"
          rows={4}
          placeholder="Anything on your mind?"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <Button
          size="lg"
          className="flex-1 rounded-2xl bg-gradient-bloom text-white shadow-glow hover:opacity-95"
          onClick={handleSave}
          disabled={saving}
        >
          {existing ? "Update entry" : "Save entry"}
        </Button>
        {existing && (
          <Button size="lg" variant="outline" className="rounded-2xl" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
