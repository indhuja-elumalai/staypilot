import { Search, Bell, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { NewBookingModal } from "./NewBookingModal";

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="h-16 px-6 lg:px-8 border-b border-border bg-card flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 px-3 h-9 rounded-lg border border-border bg-background w-72">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input placeholder="Search..." className="bg-transparent text-sm outline-none flex-1" />
        </div>

        <Button variant="ghost" asChild>
          <Link to="/dashboard/settings">
            <SettingsIcon className="h-4 w-4 mr-2" /> Template
          </Link>
        </Button>

        <NewBookingModal /> {/* This now handles its own Dialog trigger */}

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}