import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/dashboard/Topbar";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/expenses")({
  head: () => ({ meta: [{ title: "Expenses · StayPilot" }] }),
  component: Expenses,
});

const ledger = [
  ["10 Nov","Linen laundry — Spotless Co.","Operations","₹4,200","out"],
  ["10 Nov","Daily groceries — kitchen","F&B","₹6,840","out"],
  ["09 Nov","Front-desk salary — Rohan","Payroll","₹28,000","out"],
  ["09 Nov","Booking revenue — Sofia Romero","Revenue","₹38,500","in"],
  ["08 Nov","Diesel — generator","Utilities","₹3,100","out"],
  ["08 Nov","Plumber — Suite 204","Maintenance","₹1,800","out"],
  ["07 Nov","Booking revenue — Aarav Mehta","Revenue","₹14,200","in"],
];

function Expenses() {
  return (
    <>
      <Topbar
        title="Expenses & Ledger"
        subtitle="Daily costs, payroll and revenue in one timeline"
        action={<Button className="bg-primary hover:bg-primary/90 text-primary-foreground ember-glow"><Plus className="h-4 w-4 mr-1" /> Log expense</Button>}
      />
      <div className="p-6 lg:p-8 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["Spent (Nov)","₹1,84,300","-12%","down"],
            ["Earned (Nov)","₹4,62,800","+18%","up"],
            ["Net","₹2,78,500","+22%","up"],
            ["Payroll due","₹84,000","Nov 30","flat"],
          ].map(([k,v,d,dir]) => (
            <div key={k} className="rounded-xl border border-border bg-card p-4 card-soft">
              <div className="text-xs text-muted-foreground">{k}</div>
              <div className="mt-1 text-lg font-semibold">{v}</div>
              <div className={`text-xs mt-0.5 flex items-center gap-1 ${dir==="up"?"text-success":dir==="down"?"text-destructive":"text-muted-foreground"}`}>
                {dir==="up" && <TrendingUp className="h-3 w-3" />} {dir==="down" && <TrendingDown className="h-3 w-3" />} {d}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card card-soft overflow-hidden">
          <div className="px-5 h-12 flex items-center justify-between border-b border-border">
            <div className="text-sm font-semibold">Ledger</div>
            <div className="flex gap-1 text-xs">
              {["All","Operations","Payroll","F&B","Utilities","Revenue"].map((t,i)=>(
                <button key={t} className={`px-2.5 py-1 rounded-md ${i===0?"bg-foreground text-background":"text-muted-foreground hover:bg-muted"}`}>{t}</button>
              ))}
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>{["Date","Description","Category","Amount"].map(h=><th key={h} className="text-left font-medium px-5 py-2.5">{h}</th>)}</tr>
            </thead>
            <tbody>
              {ledger.map((r,i) => (
                <tr key={i} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-3 text-muted-foreground">{r[0]}</td>
                  <td className="px-5 py-3 font-medium">{r[1]}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">{r[2]}</span>
                  </td>
                  <td className={`px-5 py-3 font-medium ${r[4]==="in"?"text-success":"text-foreground"}`}>
                    {r[4]==="in" ? "+" : "−"} {r[3]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
