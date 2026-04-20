import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, BarChart3, Calendar as Cal, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const Landing = () => (
  <main className="min-h-screen bg-gradient-hero">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
      <div className="flex items-center gap-2">
        <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-bloom shadow-glow">
          <Sparkles className="h-5 w-5 text-white" strokeWidth={2.4} />
        </div>
        <span className="font-display text-xl font-bold">MindMap</span>
      </div>
      <div className="flex items-center gap-2">
        <Link to="/login"><Button variant="ghost" className="rounded-2xl">Sign in</Button></Link>
        <Link to="/signup"><Button className="rounded-2xl bg-gradient-bloom text-white shadow-glow">Get started</Button></Link>
      </div>
    </header>

    <section className="mx-auto max-w-6xl px-6 pb-20 pt-10 md:pt-20">
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div className="animate-fade-in">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-primary backdrop-blur-md">
            <Heart className="h-3 w-3" /> Built for students
          </span>
          <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.05] md:text-6xl">
            Notice your <span className="text-gradient">emotional patterns</span> before they notice you.
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            A 30-second daily check-in turns into rich insights about what lifts you up,
            what drags you down, and how to show up for yourself.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/signup">
              <Button size="lg" className="h-12 rounded-2xl bg-gradient-bloom px-7 text-white shadow-glow">
                Start free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="h-12 rounded-2xl border-white/60 bg-white/50 px-7">
                I have an account
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Self-awareness tool. Not medical or diagnostic.</p>
        </div>

        <div className="animate-slide-up">
          <div className="glass-card p-6 md:p-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Today</p>
                <h3 className="font-display text-2xl font-bold">Hi, Sam 👋</h3>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-peach shadow-peach">
                <span className="text-2xl">🙂</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/70 p-4 text-center">
                <Cal className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-2 font-display text-2xl font-bold">7</p>
                <p className="text-[10px] text-muted-foreground">day streak</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4 text-center">
                <BarChart3 className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-2 font-display text-2xl font-bold">↗</p>
                <p className="text-[10px] text-muted-foreground">trending up</p>
              </div>
              <div className="rounded-2xl bg-white/70 p-4 text-center">
                <Heart className="mx-auto h-5 w-5 text-primary" />
                <p className="mt-2 font-display text-2xl font-bold">3.8</p>
                <p className="text-[10px] text-muted-foreground">avg mood</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl bg-gradient-sky p-4">
              <p className="text-sm text-foreground/80">
                "Your mood improves on days tagged <strong>social</strong>. Maybe reach out today?"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { t: "Backfill any date", d: "Forgot yesterday? Pick any past day and log it. Edit later, anytime." },
          { t: "Pattern detection", d: "See how sleep, study, and social connect to your mood and energy." },
          { t: "Gentle nudges", d: "Human-feeling messages that nudge — never lecture or diagnose." },
        ].map(f => (
          <div key={f.t} className="glass-card p-6">
            <h4 className="font-display text-lg font-bold">{f.t}</h4>
            <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </div>
    </section>
  </main>
);

export default Landing;
