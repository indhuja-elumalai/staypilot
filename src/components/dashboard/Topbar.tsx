import { Search, Bell, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { UserButton } from "@clerk/clerk-react";
import { NewBookingModal } from "./NewBookingModal";

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
          <input placeholder="Search..." className="bg-transparent text-sm outline-none flex-1" />
        </div>



        {action !== undefined ? action : <NewBookingModal />}

        <Button variant="ghost" size="icon" asChild className="relative ml-2">
          <Link to="/">
            <Home className="h-4 w-4" />
          </Link>
        </Button>

        <Button variant="ghost" size="icon" className="relative mr-2">
          <Bell className="h-4 w-4" />
        </Button>
        
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  );
}