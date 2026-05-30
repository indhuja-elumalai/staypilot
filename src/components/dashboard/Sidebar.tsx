import { Link, useRouterState } from "@tanstack/react-router";
import { useUser, UserButton } from "@clerk/clerk-react";
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
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen sticky top-0">
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
        <Link to="/dashboard/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent/60">
          <Settings className="h-4 w-4" /> Template & Settings
        </Link>
      </div>

      <div className="p-3 mt-auto border-t border-sidebar-border">
        <div className="flex items-center px-3 py-2">
            <UserButton showName appearance={{
              elements: {
                userButtonBox: "flex-row",
                userButtonOuterIdentifier: "text-sidebar-foreground text-sm font-medium ml-3",
              }
            }} />
        </div>
      </div>
    </aside>
  );
}