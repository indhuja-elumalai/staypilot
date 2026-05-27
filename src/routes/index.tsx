import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BedDouble, BarChart3, Users, Wallet, MessageCircle, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "StayPilot — Hospitality OS for modern properties" },
      { name: "description", content: "Run bookings, guests, expenses and operations from one calm, premium dashboard built for hoteliers." },
      { property: "og:title", content: "StayPilot — Hospitality OS" },
      { property: "og:description", content: "The hospitality management platform owners actually enjoy using." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b border-border">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-navy grid place-items-center">
              <BedDouble className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold tracking-tight">StayPilot</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Features</a>
            <a href="#workflow" className="hover:text-foreground transition">Workflow</a>
            <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">Sign in</Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground ember-glow">
                  Join now <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <Button size="sm" variant="outline" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              {/* Optional: Adds the Clerk user profile circle */}
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              v2.4 — WhatsApp automations now live
            </div>
            <h1 className="mt-6 text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
              The calm hospitality OS for <span className="text-primary">modern properties.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl">
              StayPilot replaces six spreadsheets and three apps. Bookings, guests, expenses and operations — one dashboard your front desk will actually love.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <SignedOut>
                <SignInButton mode="modal">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground ember-glow">
                    Launch dashboard <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground ember-glow" asChild>
                  <Link to="/dashboard">Go to dashboard <ArrowRight className="h-4 w-4 ml-1" /></Link>
                </Button>
              </SignedIn>

              <Button size="lg" variant="outline">Book a 10-min demo</Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-muted-foreground">
              {["No card required", "Setup in 4 minutes", "Used in 38 cities"].map(t => (
                <div key={t} className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /> {t}</div>
              ))}
            </div>
          </div>

          {/* Hero preview card */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl bg-navy-gradient p-2 card-soft">
              <div className="rounded-xl bg-card overflow-hidden">
                <div className="flex items-center gap-1.5 px-4 h-9 border-b border-border">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                  <span className="ml-3 text-xs text-muted-foreground">app.staypilot.io/dashboard</span>
                </div>
                <div className="p-5 grid grid-cols-3 gap-4">
                  {[
                    { label: "Occupancy", val: "84%", sub: "+6.2%" },
                    { label: "ADR", val: "₹4,820", sub: "+2.1%" },
                    { label: "Revenue", val: "₹2.1M", sub: "+12%" },
                  ].map(k => (
                    <div key={k.label} className="rounded-lg border border-border p-3">
                      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{k.label}</div>
                      <div className="mt-1 text-xl font-semibold">{k.val}</div>
                      <div className="text-xs text-success">{k.sub}</div>
                    </div>
                  ))}
                </div>
                <div className="px-5 pb-5">
                  <div className="rounded-lg border border-border">
                    <div className="px-4 h-10 flex items-center justify-between border-b border-border text-xs text-muted-foreground">
                      <span>Today's arrivals</span><span>4 pending</span>
                    </div>
                    {[
                      ["Aarav Mehta", "Suite 204", "2 nights", "Confirmed"],
                      ["Sofia Romero", "Deluxe 118", "5 nights", "Checked-in"],
                      ["Yuki Tanaka", "Garden 02", "1 night", "Pending"],
                    ].map(([n, r, d, s]) => (
                      <div key={n} className="px-4 h-12 flex items-center justify-between text-sm border-b border-border last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="h-7 w-7 rounded-full bg-muted grid place-items-center text-[11px] font-medium">{n.split(" ").map(x => x[0]).join("")}</div>
                          <span className="font-medium">{n}</span>
                        </div>
                        <span className="text-muted-foreground">{r}</span>
                        <span className="text-muted-foreground">{d}</span>
                        <span className={`text-xs px-2 py-1 rounded-md ${s === "Confirmed" ? "bg-primary/10 text-primary" : s === "Checked-in" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-t border-border bg-card/40">
        <div className="mx-auto max-w-7xl px-6 py-24">
          <div className="max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-primary font-medium">Everything you need</div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">A complete operating system, none of the bloat.</h2>
            <p className="mt-3 text-muted-foreground">Designed for owners and managers, not engineers. Every action is two clicks away.</p>
          </div>

          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="group rounded-xl border border-border bg-card p-6 card-soft hover:-translate-y-0.5 transition">
                <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary grid place-items-center">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WORKFLOW */}
      <section id="workflow" className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs uppercase tracking-widest text-primary font-medium">Workflow</div>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">From check-in to invoice in three clicks.</h2>
            <p className="mt-3 text-muted-foreground">Front desk staff can create a booking, assign a room and send a WhatsApp confirmation in under 20 seconds.</p>
            <ol className="mt-8 space-y-4">
              {steps.map((s, i) => (
                <li key={s.title} className="flex gap-4">
                  <div className="h-8 w-8 rounded-full bg-navy text-primary grid place-items-center text-sm font-semibold shrink-0">{i + 1}</div>
                  <div>
                    <div className="font-medium">{s.title}</div>
                    <div className="text-sm text-muted-foreground">{s.desc}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl bg-navy-gradient p-8 text-white">
            <div className="text-sm text-white/60">Tonight</div>
            <div className="mt-2 text-4xl font-semibold">12 arrivals · 8 departures</div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {[
                ["Rooms occupied", "47 / 56"],
                ["Pending payments", "₹38,400"],
                ["Complaints open", "2"],
                ["Tasks done today", "18"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-white/5 border border-white/10 p-4">
                  <div className="text-white/60 text-xs">{k}</div>
                  <div className="mt-1 font-medium">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="pricing" className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">Run your property on autopilot.</h2>
          <p className="mt-3 text-muted-foreground">Free for the first 30 days. No credit card. Cancel anytime.</p>
          <div className="mt-8 flex justify-center gap-3">
            <SignInButton mode="modal">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground ember-glow">
                Open the dashboard <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </SignInButton>
            <Button size="lg" variant="outline">Talk to sales</Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-8 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-navy grid place-items-center"><BedDouble className="h-3 w-3 text-primary" /></div>
            <span>© {new Date().getFullYear()} StayPilot. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  { icon: BedDouble, title: "Instant bookings", desc: "Create a stay, assign a room and generate an invoice in under 20 seconds." },
  { icon: Users, title: "Guest CRM", desc: "Every guest, their history, preferences and VIP status — one searchable list." },
  { icon: Wallet, title: "Expenses & payroll", desc: "Log daily expenses, salaries and petty cash in a ledger your accountant will thank you for." },
  { icon: BarChart3, title: "Live analytics", desc: "Occupancy, ADR, RevPAR and revenue trends, updated as bookings happen." },
  { icon: CheckCircle2, title: "Operations pipeline", desc: "A Kanban for complaints and tasks — from To-do to Done, nothing falls through." },
  { icon: MessageCircle, title: "WhatsApp triggers", desc: "Send check-in instructions, payment reminders and promos in one tap." },
];

const steps = [
  { title: "Create the booking", desc: "Pick a guest from the CRM or add a new one in two fields." },
  { title: "Assign the stay", desc: "Choose a room, set the dates, StayPilot blocks the calendar." },
  { title: "Send & invoice", desc: "Generate the invoice and trigger a WhatsApp confirmation instantly." },
];
