import { Outlet } from "react-router";

import { AppSidebar } from "~/components/elements/app-sidebar";

// TODO: add the session and doctor-role guard (redirect to /login, sign out
// non-doctors) once the Supabase schema has been checked against CLAUDE.md Section 4.
export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
