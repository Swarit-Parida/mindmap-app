import { useSearchParams } from "react-router-dom";
import { EntryForm } from "@/components/EntryForm";

const LogEntry = () => {
  const [params] = useSearchParams();
  const date = params.get("date") || undefined;
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Log a check-in</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick any date — past days can be backfilled and updated anytime.
        </p>
      </header>
      <EntryForm initialDate={date} />
    </div>
  );
};

export default LogEntry;
