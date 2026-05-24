import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Topbar({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <header className="h-16 px-6 lg:px-8 border-b border-border bg-card flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 px-3 h-9 rounded-lg border border-border bg-background w-72">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search guests, rooms, invoices…" className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground" />
          <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5">⌘K</kbd>
        </div>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>
        {action ?? (
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground ember-glow">
            <Plus className="h-4 w-4 mr-1" /> New booking
          </Button>
        )}
      </div>
    </header>
  );
}
