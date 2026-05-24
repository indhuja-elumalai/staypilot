import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/dashboard/Topbar";
import { ArrowUpRight, ArrowDownRight, BedDouble, Users, Wallet, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Overview · StayPilot" }] }),
  component: Overview,
});

const revenue = [
  { d: "Mon", v: 32000 }, { d: "Tue", v: 41200 }, { d: "Wed", v: 38500 },
  { d: "Thu", v: 52000 }, { d: "Fri", v: 61000 }, { d: "Sat", v: 78400 }, { d: "Sun", v: 69200 },
];
const channels = [
  { c: "Direct", v: 42 }, { c: "Booking", v: 28 }, { c: "Airbnb", v: 18 }, { c: "Agoda", v: 8 }, { c: "Walk-in", v: 4 },
];

function Kpi({ icon: Icon, label, value, delta, up }: any) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 card-soft">
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center"><Icon className="h-4 w-4" /></div>
        <span className={`text-xs flex items-center gap-1 ${up ? "text-success" : "text-destructive"}`}>
          {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}{delta}
        </span>
      </div>
      <div className="mt-4 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function Overview() {
  return (
    <>
      <Topbar title="Good evening, Riya" subtitle="Here's what's happening at Coastline Residency tonight." />
      <div className="p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Kpi icon={Wallet} label="Revenue this week" value="₹3,72,300" delta="+12.4%" up />
          <Kpi icon={BedDouble} label="Occupancy" value="84%" delta="+6.2%" up />
          <Kpi icon={Users} label="Active guests" value="47" delta="+3" up />
          <Kpi icon={TrendingUp} label="ADR" value="₹4,820" delta="-1.1%" up={false} />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 card-soft">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Revenue</div>
                <div className="text-xs text-muted-foreground">Last 7 days</div>
              </div>
              <div className="flex gap-1 text-xs">
                {["7D","30D","90D"].map((t,i) => (
                  <button key={t} className={`px-2.5 py-1 rounded-md ${i===0 ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="h-64 mt-4">
              <ResponsiveContainer>
                <AreaChart data={revenue} margin={{ left: -20, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--ember)" stopOpacity={0.5}/>
                      <stop offset="100%" stopColor="var(--ember)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
                  <Area dataKey="v" stroke="var(--ember)" strokeWidth={2} fill="url(#g)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 card-soft">
            <div className="text-sm font-semibold">Booking channels</div>
            <div className="text-xs text-muted-foreground">Share of bookings</div>
            <div className="h-64 mt-4">
              <ResponsiveContainer>
                <BarChart data={channels} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="c" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
                  <Bar dataKey="v" fill="var(--navy)" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card card-soft overflow-hidden">
            <div className="px-5 h-12 flex items-center justify-between border-b border-border">
              <div className="text-sm font-semibold">Tonight's arrivals</div>
              <a className="text-xs text-primary hover:underline" href="#">View all</a>
            </div>
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="text-left font-medium px-5 py-2.5">Guest</th>
                  <th className="text-left font-medium py-2.5">Room</th>
                  <th className="text-left font-medium py-2.5">Stay</th>
                  <th className="text-left font-medium py-2.5">Amount</th>
                  <th className="text-left font-medium py-2.5">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Aarav Mehta","Suite 204","Tonight → 12 Nov","₹14,200","Confirmed"],
                  ["Sofia Romero","Deluxe 118","Tonight → 15 Nov","₹38,500","Checked-in"],
                  ["Yuki Tanaka","Garden 02","Tonight → 11 Nov","₹6,800","Pending"],
                  ["Idris Khan","Suite 301","Tonight → 13 Nov","₹22,400","Confirmed"],
                ].map(([n,r,s,a,st]) => (
                  <tr key={n} className="border-b border-border last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3 flex items-center gap-3">
                      <div className="h-7 w-7 rounded-full bg-muted grid place-items-center text-[11px] font-medium">{n.split(" ").map(x=>x[0]).join("")}</div>
                      <span className="font-medium">{n}</span>
                    </td>
                    <td className="py-3 text-muted-foreground">{r}</td>
                    <td className="py-3 text-muted-foreground">{s}</td>
                    <td className="py-3 font-medium">{a}</td>
                    <td className="py-3"><StatusPill v={st as string} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 card-soft">
            <div className="text-sm font-semibold">Today's pulse</div>
            <div className="text-xs text-muted-foreground">Live operational view</div>
            <ul className="mt-4 space-y-3 text-sm">
              {[
                ["Housekeeping done", "32 / 47", "success"],
                ["Open complaints", "2", "warning"],
                ["Pending payments", "₹38,400", "warning"],
                ["WhatsApp sent", "26", "info"],
                ["Walk-ins", "3", "info"],
              ].map(([k,v,c]) => (
                <li key={k as string} className="flex items-center justify-between">
                  <span className="text-muted-foreground">{k}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                    c==="success" ? "bg-success/10 text-success" :
                    c==="warning" ? "bg-warning/10 text-warning" : "bg-info/10 text-info"
                  }`}>{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export function StatusPill({ v }: { v: string }) {
  const map: Record<string,string> = {
    Confirmed: "bg-primary/10 text-primary",
    "Checked-in": "bg-success/10 text-success",
    Pending: "bg-warning/10 text-warning",
    Cancelled: "bg-destructive/10 text-destructive",
    VIP: "bg-primary/10 text-primary",
    Regular: "bg-muted text-muted-foreground",
  };
  return <span className={`text-xs px-2 py-1 rounded-md ${map[v] ?? "bg-muted text-muted-foreground"}`}>{v}</span>;
}
