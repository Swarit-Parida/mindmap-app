import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { BottomNav } from "./BottomNav";
import { Home, BarChart3, Calendar, User, Plus, LogOut, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";

const navItems = [
  { to: "/app", label: "Dashboard", icon: Home, end: true },
  { to: "/app/log", label: "Log entry", icon: Plus, end: false },
  { to: "/app/history", label: "History", icon: Calendar, end: false },
  { to: "/app/analytics", label: "Insights", icon: BarChart3, end: false },
  { to: "/app/profile", label: "Profile", icon: User, end: false },
];

export const AppLayout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="mx-auto flex max-w-7xl">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-2 border-r border-white/40 bg-white/40 px-4 py-6 backdrop-blur-md md:flex">
          <div className="mb-6 flex items-center gap-2 px-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-bloom shadow-glow">
              <Sparkles className="h-5 w-5 text-white" strokeWidth={2.4} />
            </div>
            <span className="font-display text-xl font-bold">MindMap</span>
          </div>
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-white text-primary shadow-soft"
                    : "text-muted-foreground hover:bg-white/60 hover:text-foreground"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          <div className="mt-auto rounded-2xl bg-white/60 p-3">
            <p className="truncate text-xs text-muted-foreground">Signed in as</p>
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </Button>
          </div>
        </aside>

        <main className="flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-10">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
};
