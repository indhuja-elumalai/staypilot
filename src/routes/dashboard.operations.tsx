import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/dashboard/Topbar";
import { AlertCircle, Clock, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/operations")({
  head: () => ({ meta: [{ title: "Operations · StayPilot" }] }),
  component: Ops,
});

const cols = [
  {
    key: "todo", label: "To do", icon: AlertCircle, accent: "text-warning",
    items: [
      ["Suite 204", "AC not cooling — guest reported", "High", "Maintenance"],
      ["Deluxe 118", "Replace bathroom slippers", "Low", "Housekeeping"],
      ["Lobby", "Order fresh flowers", "Med", "F&B"],
    ],
  },
  {
    key: "doing", label: "In progress", icon: Clock, accent: "text-info",
    items: [
      ["Garden 02", "Geyser repair in progress", "High", "Maintenance"],
      ["Suite 301", "Late check-in arrangement", "Med", "Front desk"],
    ],
  },
  {
    key: "done", label: "Done", icon: CheckCircle2, accent: "text-success",
    items: [
      ["Deluxe 210", "Breakfast served in room", "—", "F&B"],
      ["Suite 204", "WhatsApp check-in sent", "—", "Front desk"],
      ["Pool", "Morning cleaning complete", "—", "Housekeeping"],
    ],
  },
];

function Ops() {
  return (
    <>
      <Topbar
        title="Operations"
        subtitle="Complaints & tasks across the property"
        action={<Button className="bg-primary hover:bg-primary/90 text-primary-foreground ember-glow"><Plus className="h-4 w-4 mr-1" /> New task</Button>}
      />
      <div className="p-6 lg:p-8">
        <div className="grid lg:grid-cols-3 gap-5">
          {cols.map(col => (
            <div key={col.key} className="rounded-xl border border-border bg-card card-soft flex flex-col">
              <div className="px-4 h-12 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <col.icon className={`h-4 w-4 ${col.accent}`} /> {col.label}
                </div>
                <span className="text-xs text-muted-foreground">{col.items.length}</span>
              </div>
              <div className="p-3 space-y-2.5">
                {col.items.map((t,i) => (
                  <div key={i} className="rounded-lg border border-border bg-background p-3 hover:border-primary/40 transition">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">{t[0]}</div>
                      <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        t[2]==="High" ? "bg-destructive/10 text-destructive" :
                        t[2]==="Med" ? "bg-warning/10 text-warning" :
                        t[2]==="Low" ? "bg-info/10 text-info" : "bg-muted text-muted-foreground"
                      }`}>{t[2]}</span>
                    </div>
                    <div className="mt-1 text-sm font-medium">{t[1]}</div>
                    <div className="mt-2 text-xs text-muted-foreground">{t[3]}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
