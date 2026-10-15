import { Outlet } from "react-router";

import { AppSidebar } from "~/components/elements/app-sidebar";
import { requireDoctor, useSignOutRedirect } from "~/modules/Auth";

// Every doctor page sits under this layout, so this one guard covers them all.
export async function clientLoader() {
  return requireDoctor();
}

export default function AppLayout() {
  useSignOutRedirect();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AppSidebar />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  );
}
