// Firebase-backed auth + entries service. Mirrors the localBackend API.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  onAuthStateChanged,
  type User as FbUser,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "./firebase";
import type { AppUser, Entry } from "@/types";

const requireAuth = () => {
  if (!auth) throw new Error("Firebase auth not initialised");
  return auth;
};
const requireDb = () => {
  if (!db) throw new Error("Firestore not initialised");
  return db;
};

const toAppUser = (u: FbUser): AppUser => ({
  uid: u.uid,
  email: u.email ?? "",
  name: u.displayName || (u.email ? u.email.split("@")[0] : "Friend"),
});

export const firebaseAuthService = {
  onChange(cb: (u: AppUser | null) => void) {
    const a = requireAuth();
    return onAuthStateChanged(a, (u) => cb(u ? toAppUser(u) : null));
  },
  async signUp(name: string, email: string, password: string): Promise<AppUser> {
    const a = requireAuth();
    const cred = await createUserWithEmailAndPassword(a, email, password);
    if (name) await updateProfile(cred.user, { displayName: name });
    // Create user profile doc
    const d = requireDb();
    await setDoc(doc(d, "users", cred.user.uid), {
      uid: cred.user.uid,
      email: cred.user.email,
      name: name || email.split("@")[0],
      createdAt: serverTimestamp(),
    });
    return { uid: cred.user.uid, email: cred.user.email ?? email, name: name || email.split("@")[0] };
  },
  async signIn(email: string, password: string): Promise<AppUser> {
    const a = requireAuth();
    const cred = await signInWithEmailAndPassword(a, email, password);
    return toAppUser(cred.user);
  },
  async signOut() {
    const a = requireAuth();
    await fbSignOut(a);
  },
};

const entryDocId = (userId: string, date: string) => `${userId}_${date}`;

export const firebaseEntriesService = {
  async list(userId: string): Promise<Entry[]> {
    const d = requireDb();
    const q = query(collection(d, "entries"), where("userId", "==", userId));
    const snap = await getDocs(q);
    const out: Entry[] = [];
    snap.forEach((s) => out.push(s.data() as Entry));
    return out.sort((a, b) => b.date.localeCompare(a.date));
  },
  async upsert(
    input: Omit<Entry, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ): Promise<Entry> {
    const d = requireDb();
    const id = entryDocId(input.userId, input.date);
    const now = Date.now();
    const ref = doc(d, "entries", id);
    // Read existing to preserve createdAt
    const existingSnap = await getDocs(
      query(
        collection(d, "entries"),
        where("userId", "==", input.userId),
        where("date", "==", input.date)
      )
    );
    let createdAt = now;
    existingSnap.forEach((s) => {
      const data = s.data() as Entry;
      if (data.createdAt) createdAt = data.createdAt;
    });
    const entry: Entry = {
      id,
      userId: input.userId,
      date: input.date,
      mood: input.mood,
      stress: input.stress,
      energy: input.energy,
      tags: input.tags,
      notes: input.notes ?? "",
      createdAt,
      updatedAt: now,
    };
    await setDoc(ref, entry);
    return entry;
  },
  async remove(userId: string, id: string): Promise<void> {
    const d = requireDb();
    await deleteDoc(doc(d, "entries", id));
  },
};
