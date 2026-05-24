import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/dashboard/Topbar";
import { StatusPill } from "./dashboard.index";
import { Printer, Receipt, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/bookings")({
  head: () => ({ meta: [{ title: "Bookings · StayPilot" }] }),
  component: Bookings,
});

const rows = [
  ["SP-2041","Aarav Mehta","Suite 204","10 Nov → 12 Nov","2","₹14,200","Confirmed"],
  ["SP-2040","Sofia Romero","Deluxe 118","10 Nov → 15 Nov","5","₹38,500","Checked-in"],
  ["SP-2039","Yuki Tanaka","Garden 02","10 Nov → 11 Nov","1","₹6,800","Pending"],
  ["SP-2038","Idris Khan","Suite 301","10 Nov → 13 Nov","3","₹22,400","Confirmed"],
  ["SP-2037","Mei Lin","Deluxe 210","09 Nov → 12 Nov","3","₹19,500","Checked-in"],
  ["SP-2036","Noah Schmidt","Garden 05","08 Nov → 09 Nov","1","₹5,400","Cancelled"],
  ["SP-2035","Priya Verma","Suite 102","08 Nov → 10 Nov","2","₹15,600","Checked-in"],
];

function Bookings() {
  return (
    <>
      <Topbar title="Bookings" subtitle="All stays across your property" />
      <div className="p-6 lg:p-8 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ["Today", "12 arrivals"],
            ["This week", "84 stays"],
            ["Revenue (week)", "₹3.72L"],
            ["Avg. stay", "2.6 nights"],
          ].map(([k,v]) => (
            <div key={k} className="rounded-xl border border-border bg-card p-4 card-soft">
              <div className="text-xs text-muted-foreground">{k}</div>
              <div className="mt-1 text-lg font-semibold">{v}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card card-soft overflow-hidden">
          <div className="px-5 h-14 flex items-center justify-between border-b border-border gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {["All","Confirmed","Checked-in","Pending","Cancelled"].map((t,i)=>(
                <button key={t} className={`text-xs px-3 py-1.5 rounded-md ${i===0?"bg-foreground text-background":"text-muted-foreground hover:bg-muted"}`}>{t}</button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm"><Filter className="h-3.5 w-3.5 mr-1" /> Filters</Button>
              <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5 mr-1" /> Export</Button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                {["Booking","Guest","Room","Stay","Nights","Amount","Status",""].map(h=>(
                  <th key={h} className="text-left font-medium px-5 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r[0]} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{r[0]}</td>
                  <td className="px-5 py-3 font-medium">{r[1]}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r[2]}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r[3]}</td>
                  <td className="px-5 py-3 text-muted-foreground">{r[4]}</td>
                  <td className="px-5 py-3 font-medium">{r[5]}</td>
                  <td className="px-5 py-3"><StatusPill v={r[6]} /></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Receipt className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Printer className="h-3.5 w-3.5" /></Button>
                    </div>
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
