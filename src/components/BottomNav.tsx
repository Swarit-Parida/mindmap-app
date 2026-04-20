import { NavLink } from "react-router-dom";
import { Home, BarChart3, Calendar, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/app", label: "Home", icon: Home, end: true },
  { to: "/app/history", label: "History", icon: Calendar, end: false },
  { to: "/app/log", label: "Log", icon: Plus, end: false, primary: true },
  { to: "/app/analytics", label: "Insights", icon: BarChart3, end: false },
  { to: "/app/profile", label: "Profile", icon: User, end: false },
];

export const BottomNav = () => (
  <nav className="fixed bottom-0 inset-x-0 z-40 px-3 pb-3 pt-2 md:hidden">
    <div className="glass-card mx-auto max-w-md flex items-center justify-around px-2 py-2">
      {items.map(({ to, label, icon: Icon, end, primary }) => (
        <NavLink
          key={to} to={to} end={end}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center gap-0.5 rounded-2xl px-3 py-2 text-[10px] font-medium transition-all",
              primary && "h-12 w-12 -mt-6 bg-gradient-bloom text-white shadow-glow",
              !primary && (isActive ? "text-primary" : "text-muted-foreground hover:text-foreground")
            )
          }
        >
          <Icon className={cn("h-5 w-5", primary && "h-6 w-6")} strokeWidth={2.2} />
          {!primary && <span>{label}</span>}
        </NavLink>
      ))}
    </div>
  </nav>
);
