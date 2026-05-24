import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/dashboard/Topbar";
import { StatusPill } from "./dashboard.index";
import { Star, Phone, Mail, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/customers")({
  head: () => ({ meta: [{ title: "Customers · StayPilot" }] }),
  component: Customers,
});

const guests = [
  ["Aarav Mehta","aarav@hey.com","+91 98201 23123","12","₹1.42L","VIP"],
  ["Sofia Romero","sofia.r@gmail.com","+34 612 88 21 04","4","₹86,200","Regular"],
  ["Yuki Tanaka","yuki@jp.io","+81 80 1122 3344","1","₹6,800","Regular"],
  ["Idris Khan","idris@studio.co","+91 98990 34211","8","₹98,400","VIP"],
  ["Mei Lin","mei@orchid.cn","+86 138 1234 5678","2","₹32,600","Regular"],
  ["Priya Verma","priya@workmail.in","+91 99887 11223","6","₹74,300","VIP"],
];

function Customers() {
  return (
    <>
      <Topbar
        title="Customers"
        subtitle="Your guest CRM — searchable, sortable, human"
        action={<Button className="bg-primary hover:bg-primary/90 text-primary-foreground ember-glow"><Plus className="h-4 w-4 mr-1" /> Add guest</Button>}
      />
      <div className="p-6 lg:p-8 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[["Total guests","1,284"],["VIP","182"],["New this month","42"],["Repeat rate","38%"]].map(([k,v])=>(
            <div key={k} className="rounded-xl border border-border bg-card p-4 card-soft">
              <div className="text-xs text-muted-foreground">{k}</div>
              <div className="mt-1 text-lg font-semibold">{v}</div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card card-soft overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground bg-muted/40">
              <tr>
                {["Guest","Contact","Stays","Lifetime value","Tier",""].map(h=>(
                  <th key={h} className="text-left font-medium px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guests.map(g => (
                <tr key={g[0]} className="border-t border-border hover:bg-muted/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted grid place-items-center text-[11px] font-medium">{g[0].split(" ").map(x=>x[0]).join("")}</div>
                      <div>
                        <div className="font-medium flex items-center gap-1.5">
                          {g[0]} {g[5]==="VIP" && <Star className="h-3 w-3 fill-primary text-primary" />}
                        </div>
                        <div className="text-xs text-muted-foreground">{g[1]}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">
                    <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {g[2]}</div>
                  </td>
                  <td className="px-5 py-3">{g[3]}</td>
                  <td className="px-5 py-3 font-medium">{g[4]}</td>
                  <td className="px-5 py-3"><StatusPill v={g[5]} /></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Mail className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="h-3.5 w-3.5" /></Button>
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
