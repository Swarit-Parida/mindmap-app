// Local-storage backed implementation of auth + entries.
// Mirrors Firebase semantics so swapping to real Firebase is a small change.
// When `isFirebaseConfigured` is true, replace with Firebase calls.

import { AppUser, Entry } from "@/types";

const USERS_KEY = "mindmap.users.v1";
const SESSION_KEY = "mindmap.session.v1";
const ENTRIES_KEY = "mindmap.entries.v1";

interface StoredUser extends AppUser { passwordHash: string; }

const read = <T,>(key: string, fallback: T): T => {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) as T : fallback; }
  catch { return fallback; }
};
const write = (key: string, value: unknown) => localStorage.setItem(key, JSON.stringify(value));

// not crypto-strong; fine for a demo.
const hash = (s: string) => {
  let h = 0; for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; }
  return String(h);
};

const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

// ---------- Auth ----------
export const localAuth = {
  current(): AppUser | null { return read<AppUser | null>(SESSION_KEY, null); },

  async signUp(name: string, email: string, password: string): Promise<AppUser> {
    const users = read<StoredUser[]>(USERS_KEY, []);
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("An account with that email already exists.");
    }
    const user: StoredUser = { uid: uid(), name, email, passwordHash: hash(password) };
    users.push(user); write(USERS_KEY, users);
    const session: AppUser = { uid: user.uid, name: user.name, email: user.email };
    write(SESSION_KEY, session);
    return session;
  },

  async signIn(email: string, password: string): Promise<AppUser> {
    const users = read<StoredUser[]>(USERS_KEY, []);
    const u = users.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!u || u.passwordHash !== hash(password)) throw new Error("Invalid email or password.");
    const session: AppUser = { uid: u.uid, name: u.name, email: u.email };
    write(SESSION_KEY, session);
    return session;
  },

  async signOut() { localStorage.removeItem(SESSION_KEY); },
};

// ---------- Entries ----------
const allEntries = (): Entry[] => read<Entry[]>(ENTRIES_KEY, []);
const saveAll = (e: Entry[]) => write(ENTRIES_KEY, e);

export const entriesService = {
  async list(userId: string): Promise<Entry[]> {
    return allEntries().filter(e => e.userId === userId).sort((a, b) => b.date.localeCompare(a.date));
  },

  async getByDate(userId: string, date: string): Promise<Entry | undefined> {
    return allEntries().find(e => e.userId === userId && e.date === date);
  },

  async upsert(input: Omit<Entry, "id" | "createdAt" | "updatedAt"> & { id?: string }): Promise<Entry> {
    const list = allEntries();
    const now = Date.now();
    // One entry per (user,date). Update if exists.
    const existingIdx = list.findIndex(e =>
      e.userId === input.userId && e.date === input.date
    );
    if (existingIdx >= 0) {
      const updated: Entry = { ...list[existingIdx], ...input, id: list[existingIdx].id, updatedAt: now };
      list[existingIdx] = updated; saveAll(list); return updated;
    }
    const created: Entry = { ...input, id: input.id ?? uid(), createdAt: now, updatedAt: now };
    list.push(created); saveAll(list); return created;
  },

  async remove(userId: string, id: string): Promise<void> {
    saveAll(allEntries().filter(e => !(e.userId === userId && e.id === id)));
  },
};
