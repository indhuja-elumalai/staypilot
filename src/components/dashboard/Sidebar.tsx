import { Link, useRouterState } from "@tanstack/react-router";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import {
  BedDouble, LayoutDashboard, CalendarCheck, Users, Wallet,
  BarChart3, ListTodo, MessageCircle, Settings, LifeBuoy, LogOut
} from "lucide-react";

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/dashboard/customers", label: "Customers", icon: Users },
  { to: "/dashboard/expenses", label: "Expenses", icon: Wallet },
  { to: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard/operations", label: "Operations", icon: ListTodo },
  { to: "/dashboard/whatsapp", label: "WhatsApp", icon: MessageCircle },
];

export function Sidebar() {
  const { user, isLoaded } = useUser();
  const path = useRouterState({ select: s => s.location.pathname });

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="h-16 px-5 flex items-center gap-2 border-b border-sidebar-border">
        <div className="h-8 w-8 rounded-lg bg-sidebar-accent grid place-items-center">
          <BedDouble className="h-4 w-4 text-primary" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight">StayPilot</div>
          <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50">Pro · HMS</div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(item => {
          const active = path === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active
                ? "bg-sidebar-accent text-white"
                : "text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent/60"
                }`}
            >
              <item.icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
              {item.label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-sidebar-border space-y-0.5">
        <Link to="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent/60">
          <LifeBuoy className="h-4 w-4" /> Help & support
        </Link>
        <Link to="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent/60">
          <Settings className="h-4 w-4" /> Settings
        </Link>
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-sidebar-border">
        <SignOutButton redirectUrl="/">
          <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-red-400 hover:bg-sidebar-accent/60 transition">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </SignOutButton>
      </div>

      {/* Dynamic User Profile */}
      <div className="p-3 mt-auto">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 bg-sidebar-accent/40">
          <div className="h-8 w-8 rounded-full bg-primary/20 grid place-items-center text-xs font-semibold text-primary">
            {isLoaded ? user?.firstName?.charAt(0) : "..."}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">
              {isLoaded ? (user?.fullName || "Guest") : "Loading..."}
            </div>
            <div className="text-[11px] text-sidebar-foreground/60 truncate">Property Manager</div>
          </div>
        </div>
      </div>
    </aside>
  );
}