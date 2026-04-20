import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Entry } from "@/types";
import { entriesService as localEntries } from "@/services/localBackend";
import { firebaseEntriesService } from "@/services/firebaseBackend";
import { isFirebaseConfigured } from "@/services/firebase";
import { useAuth } from "./AuthContext";

const entriesService = isFirebaseConfigured ? firebaseEntriesService : localEntries;

interface EntriesContextValue {
  entries: Entry[];
  loading: boolean;
  refresh: () => Promise<void>;
  upsert: (input: Omit<Entry, "id" | "createdAt" | "updatedAt" | "userId">) => Promise<Entry>;
  remove: (id: string) => Promise<void>;
  getByDate: (date: string) => Entry | undefined;
}

const EntriesContext = createContext<EntriesContextValue | undefined>(undefined);

export const EntriesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) { setEntries([]); return; }
    setLoading(true);
    setEntries(await entriesService.list(user.uid));
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const upsert = useCallback(async (input: Omit<Entry, "id" | "createdAt" | "updatedAt" | "userId">) => {
    if (!user) throw new Error("Not authenticated");
    const e = await entriesService.upsert({ ...input, userId: user.uid });
    await refresh();
    return e;
  }, [user, refresh]);

  const remove = useCallback(async (id: string) => {
    if (!user) return;
    await entriesService.remove(user.uid, id);
    await refresh();
  }, [user, refresh]);

  const getByDate = useCallback((date: string) => entries.find(e => e.date === date), [entries]);

  const value = useMemo(() => ({ entries, loading, refresh, upsert, remove, getByDate }),
    [entries, loading, refresh, upsert, remove, getByDate]);

  return <EntriesContext.Provider value={value}>{children}</EntriesContext.Provider>;
};

export const useEntries = () => {
  const ctx = useContext(EntriesContext);
  if (!ctx) throw new Error("useEntries must be used inside EntriesProvider");
  return ctx;
};
