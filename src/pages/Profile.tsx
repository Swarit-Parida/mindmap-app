import { useAuth } from "@/context/AuthContext";
import { useEntries } from "@/context/EntriesContext";
import { Button } from "@/components/ui/button";
import { LogOut, Mail, User as UserIcon, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { streak } from "@/utils/insights";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { entries } = useEntries();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `mindmap-entries-${new Date().toISOString().slice(0,10)}.json`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Profile</h1>
      </header>

      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-bloom text-2xl font-bold text-white shadow-glow">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <p className="font-display text-xl font-bold">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/70 p-4">
            <p className="text-xs uppercase text-muted-foreground">Total entries</p>
            <p className="font-display text-2xl font-bold">{entries.length}</p>
          </div>
          <div className="rounded-2xl bg-white/70 p-4">
            <p className="text-xs uppercase text-muted-foreground">Current streak</p>
            <p className="font-display text-2xl font-bold">{streak(entries)} day{streak(entries) === 1 ? "" : "s"}</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 space-y-3">
        <h2 className="font-display text-lg font-bold">Account</h2>
        <div className="flex items-center gap-3 rounded-2xl bg-white/60 p-3 text-sm">
          <UserIcon className="h-4 w-4 text-muted-foreground" /> {user?.name}
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white/60 p-3 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" /> {user?.email}
        </div>
        <Button variant="outline" className="w-full justify-start rounded-2xl" onClick={exportData}>
          <Database className="mr-2 h-4 w-4" /> Export my data (JSON)
        </Button>
        <Button variant="outline" className="w-full justify-start rounded-2xl" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" /> Sign out
        </Button>
      </div>

      <div className="glass-card p-5">
        <p className="text-xs text-muted-foreground">
          MindMap is a self-awareness wellness tool. It is not a medical, diagnostic, or therapeutic service.
          If you're going through a hard time, please reach out to someone you trust or a qualified professional.
        </p>
      </div>
    </div>
  );
};

export default Profile;
