import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: ({ context }) => {
    // This is the cleanest way to protect routes in TanStack Router
    // (If using a simple component approach is easier for you, use the code below)
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <>
      <SignedIn>
        <div className="min-h-screen flex bg-background">
          <Sidebar />
          <main className="flex-1 min-w-0 flex flex-col">
            <Outlet />
          </main>
        </div>
      </SignedIn>
      <SignedOut>
        {/* Force user to your custom sign-in page instead of Clerk's default */}
        <div className="flex items-center justify-center min-h-screen">
          <a href="/sign-in" className="text-primary underline">Please sign in to continue</a>
        </div>
      </SignedOut>
    </>
  );
}