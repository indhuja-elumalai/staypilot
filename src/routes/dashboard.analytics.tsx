import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/dashboard/Topbar";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, Pie, PieChart, Legend } from "recharts";

export const Route = createFileRoute("/dashboard/analytics")({
  head: () => ({ meta: [{ title: "Analytics · StayPilot" }] }),
  component: Analytics,
});

const trend = Array.from({length:30}, (_,i)=>({d:`${i+1}`, occ: 60+Math.round(Math.sin(i/3)*15+i/2), rev: 30+Math.round(Math.cos(i/4)*10+i)}));
const pie = [
  { name: "Suites", value: 38, c: "var(--ember)" },
  { name: "Deluxe", value: 32, c: "var(--navy)" },
  { name: "Garden", value: 20, c: "var(--info)" },
  { name: "Standard", value: 10, c: "var(--muted-foreground)" },
];

function Analytics() {
  return (
    <>
      <Topbar title="Analytics" subtitle="Performance across the last 30 days" />
      <div className="p-6 lg:p-8 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[["RevPAR","₹4,051"],["ADR","₹4,820"],["Occupancy","84%"],["LOS","2.6"]].map(([k,v])=>(
            <div key={k} className="rounded-xl border border-border bg-card p-4 card-soft">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{k}</div>
              <div className="mt-1 text-2xl font-semibold">{v}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 card-soft">
          <div className="text-sm font-semibold">Occupancy vs Revenue</div>
          <div className="text-xs text-muted-foreground">Last 30 days</div>
          <div className="h-72 mt-4">
            <ResponsiveContainer>
              <AreaChart data={trend} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="o" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="var(--navy)" stopOpacity={0.35}/>
                    <stop offset="100%" stopColor="var(--navy)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}/>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}/>
                <Area dataKey="occ" stroke="var(--navy)" strokeWidth={2} fill="url(#o)" />
                <Line dataKey="rev" stroke="var(--ember)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <div className="rounded-xl border border-border bg-card p-5 card-soft">
            <div className="text-sm font-semibold">Room mix</div>
            <div className="h-64 mt-2">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pie} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {pie.map((p,i)=><Cell key={i} fill={p.c as string} />)}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 card-soft">
            <div className="text-sm font-semibold">Top performing rooms</div>
            <div className="mt-4 space-y-3">
              {[
                ["Suite 204", 92],
                ["Deluxe 118", 87],
                ["Suite 301", 81],
                ["Garden 02", 74],
                ["Deluxe 210", 68],
              ].map(([n,p]) => (
                <div key={n as string}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{n}</span>
                    <span className="text-muted-foreground">{p}% occ</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${p}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
