import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { AppUser } from "@/types";
import { localAuth } from "@/services/localBackend";

interface AuthContextValue {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(localAuth.current());
    setLoading(false);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setUser(await localAuth.signIn(email, password));
  }, []);
  const signUp = useCallback(async (name: string, email: string, password: string) => {
    setUser(await localAuth.signUp(name, email, password));
  }, []);
  const signOut = useCallback(async () => {
    await localAuth.signOut(); setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, signIn, signUp, signOut }),
    [user, loading, signIn, signUp, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
