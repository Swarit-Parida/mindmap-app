import { useState } from "react";
import { Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

interface Props { mode: "login" | "signup"; }

export const AuthPage = ({ mode }: Props) => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/app" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") await signUp(name.trim() || "Friend", email.trim(), password);
      else await signIn(email.trim(), password);
      const to = (location.state as any)?.from || "/app";
      navigate(to, { replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally { setBusy(false); }
  };

  return (
    <main className="min-h-screen bg-gradient-hero">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-10">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-bloom shadow-glow">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2.4} />
          </div>
          <span className="font-display text-2xl font-bold">MindMap</span>
        </Link>

        <div className="glass-card p-7">
          <h1 className="font-display text-2xl font-bold">
            {mode === "signup" ? "Create your space" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Track moods, spot patterns, feel a little more in tune with yourself."
              : "Pick up where you left off."}
          </p>

          <form className="mt-6 space-y-4" onSubmit={submit}>
            {mode === "signup" && (
              <div>
                <Label htmlFor="name">Your name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 rounded-2xl bg-white/80" placeholder="Alex" required />
              </div>
            )}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 rounded-2xl bg-white/80" placeholder="you@example.com" required />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 rounded-2xl bg-white/80" placeholder="At least 6 characters" minLength={6} required />
            </div>

            <Button type="submit" disabled={busy}
              className="h-11 w-full rounded-2xl bg-gradient-bloom text-white shadow-glow hover:opacity-95">
              {busy ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>Already here? <Link to="/login" className="font-semibold text-primary">Sign in</Link></>
            ) : (
              <>New to MindMap? <Link to="/signup" className="font-semibold text-primary">Create an account</Link></>
            )}
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          MindMap is a self-awareness companion — not a medical or diagnostic tool.
        </p>
      </div>
    </main>
  );
};
