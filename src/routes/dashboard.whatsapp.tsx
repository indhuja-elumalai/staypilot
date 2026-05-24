import { createFileRoute } from "@tanstack/react-router";
import { Topbar } from "@/components/dashboard/Topbar";
import { Send, CheckCheck, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/whatsapp")({
  head: () => ({ meta: [{ title: "WhatsApp · StayPilot" }] }),
  component: Wa,
});

const templates = [
  { t: "Check-in instructions", d: "Sent on confirmed booking", body: "Hi {{name}}, welcome to Coastline Residency! Your suite {{room}} is ready from 2 PM. Reply to this message for anything you need." },
  { t: "Payment reminder", d: "Sent 24h before check-in", body: "Hi {{name}}, a gentle reminder — ₹{{amount}} is pending for your upcoming stay on {{date}}. Tap to pay: {{link}}" },
  { t: "Checkout & feedback", d: "Sent on checkout", body: "Thank you for staying with us, {{name}}. We'd love your feedback in 30 seconds: {{link}}" },
  { t: "Promo — weekend escape", d: "Manual broadcast", body: "Hi {{name}}, weekend free? Suites from ₹3,999 — only this Fri–Sun. Reply YES to lock yours." },
];

const conv = [
  { from: "guest", text: "Hi! Is early check-in possible tomorrow?" },
  { from: "you", text: "Hi Aarav, absolutely — your suite will be ready from 11 AM." },
  { from: "guest", text: "Perfect, thank you." },
  { from: "you", text: "Sent your invoice and entry code. See you soon ✨" },
];

function Wa() {
  return (
    <>
      <Topbar title="WhatsApp" subtitle="Send check-ins, reminders and promos in one tap" action={<Button className="bg-primary hover:bg-primary/90 text-primary-foreground ember-glow"><Send className="h-4 w-4 mr-1" /> Broadcast</Button>} />
      <div className="p-6 lg:p-8 grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            {[["Sent today","26"],["Delivered","24"],["Read rate","91%"]].map(([k,v])=>(
              <div key={k} className="rounded-xl border border-border bg-card p-4 card-soft">
                <div className="text-xs text-muted-foreground">{k}</div>
                <div className="mt-1 text-lg font-semibold">{v}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card card-soft">
            <div className="px-5 h-12 border-b border-border flex items-center justify-between">
              <div className="text-sm font-semibold">Templates</div>
              <button className="text-xs text-primary hover:underline">New template</button>
            </div>
            <div className="divide-y divide-border">
              {templates.map(tp => (
                <div key={tp.t} className="px-5 py-4 flex items-start gap-4 hover:bg-muted/30">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary grid place-items-center shrink-0">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{tp.t}</div>
                      <span className="text-xs text-muted-foreground">{tp.d}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{tp.body}</div>
                  </div>
                  <Button size="sm" variant="outline">Trigger</Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Phone preview */}
        <div className="lg:col-span-2">
          <div className="mx-auto max-w-sm rounded-[2rem] bg-navy-gradient p-3 card-soft">
            <div className="rounded-[1.5rem] bg-card overflow-hidden">
              <div className="h-12 px-4 flex items-center gap-3 border-b border-border">
                <div className="h-8 w-8 rounded-full bg-muted grid place-items-center text-[11px] font-medium">AM</div>
                <div>
                  <div className="text-sm font-medium">Aarav Mehta</div>
                  <div className="text-[11px] text-success">online</div>
                </div>
              </div>
              <div className="p-3 space-y-2 bg-muted/30 min-h-[380px]">
                {conv.map((m,i)=>(
                  <div key={i} className={`flex ${m.from==="you"?"justify-end":"justify-start"}`}>
                    <div className={`max-w-[78%] text-sm px-3 py-2 rounded-2xl ${
                      m.from==="you"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card border border-border rounded-bl-sm"
                    }`}>
                      {m.text}
                      {m.from==="you" && <CheckCheck className="inline h-3 w-3 ml-1 opacity-80" />}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-border flex gap-2">
                <input placeholder="Type a message" className="flex-1 text-sm bg-muted rounded-full px-4 h-9 outline-none" />
                <button className="h-9 w-9 rounded-full bg-primary text-primary-foreground grid place-items-center"><Send className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
