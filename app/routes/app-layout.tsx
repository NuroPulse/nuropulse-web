import { Outlet } from "react-router";

import type { Route } from "./+types/app-layout";
import { AppSidebar, readSidebarOpenCookie } from "~/components/elements/app-sidebar";
import { MobileSidebarTrigger } from "~/components/elements/mobile-sidebar-trigger";
import { SidebarProvider } from "~/components/ui/sidebar";
import { requireDoctor, useSignOut, useSignOutRedirect } from "~/modules/Auth";

// Every doctor page sits under this layout, so this one guard covers them all.
export async function clientLoader() {
  const profile = await requireDoctor();
  return { profile, sidebarOpen: readSidebarOpenCookie() };
}

export default function AppLayout({ loaderData }: Route.ComponentProps) {
  useSignOutRedirect();
  const signOut = useSignOut();

  return (
    <SidebarProvider defaultOpen={loaderData.sidebarOpen} className="bg-background text-foreground">
      <AppSidebar
        doctorName={loaderData.profile.fullName}
        onSignOut={() => signOut.mutate()}
        signingOut={signOut.isPending}
      />
      <div className="min-w-0 flex-1">
        <MobileSidebarTrigger />
        <Outlet />
      </div>
    </SidebarProvider>
  );
}
