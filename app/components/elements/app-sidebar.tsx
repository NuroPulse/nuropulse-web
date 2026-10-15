import {
  Info,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Pill,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import { Link, useLocation } from "react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "~/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/patients", label: "Daftar Pasien", icon: Users },
  { to: "/medicines", label: "Daftar Obat", icon: Pill },
  { to: "/profile", label: "Profil Saya", icon: User },
];

const disclaimer = "NuroPulse bukan alat diagnosis dan tidak menggantikan pemeriksaan dokter.";

// SidebarProvider writes this cookie whenever the sidebar is toggled.
const SIDEBAR_COOKIE = "sidebar_state";

// Restores the last wide/narrow choice after a full page reload.
export function readSidebarOpenCookie(): boolean {
  const match = document.cookie.match(new RegExp(`(?:^|; )${SIDEBAR_COOKIE}=(true|false)`));
  return match ? match[1] === "true" : true;
}

type AppSidebarProps = {
  doctorName: string;
  onSignOut: () => void;
  signingOut?: boolean;
};

// Receives the doctor's name and sign-out from the layout route: components/ never
// import from modules/ (CLAUDE.md Section 6).
export function AppSidebar({ doctorName, onSignOut, signingOut = false }: AppSidebarProps) {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const { pathname } = useLocation();
  const collapsed = state === "collapsed" && !isMobile;
  const ToggleIcon = collapsed ? PanelLeftOpen : PanelLeftClose;
  const toggleLabel = collapsed ? "Perlebar sidebar" : "Perkecil sidebar";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 pt-6 pb-2 group-data-[collapsible=icon]:px-3">
        <div className="flex items-center justify-between gap-2 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-3">
          <Link
            to="/dashboard"
            className="flex min-w-0 items-center gap-2.5 rounded-xl text-primary-600 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-50">
              {/* Decorative: the wordmark next to it names the link (kept for screen readers when narrow). */}
              <img src="/assets/shared/logo-biru.svg" alt="" className="block h-6 w-auto" />
            </span>
            <span className="truncate text-h6 tracking-tight group-data-[collapsible=icon]:sr-only">
              NuroPulse
            </span>
          </Link>

          {!isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={toggleSidebar}
                  aria-label={toggleLabel}
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-sunken hover:text-primary-600 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none group-data-[collapsible=icon]:border group-data-[collapsible=icon]:border-line"
                >
                  <ToggleIcon aria-hidden="true" className="size-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" hidden={!collapsed}>
                {toggleLabel}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 group-data-[collapsible=icon]:px-3">
        <SidebarGroup className="p-0 pt-4">
          <SidebarGroupLabel className="px-3 text-sh9 text-ink-muted">MENU</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map(({ to, label, icon: Icon }) => {
                // Sub-routes keep their parent highlighted, e.g. /patients/:id → Daftar Pasien.
                const active = pathname === to || pathname.startsWith(`${to}/`);
                return (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={label}
                      className="h-11 gap-3 rounded-xl px-3 text-sh8 text-ink-muted hover:bg-surface-sunken hover:text-ink data-active:bg-secondary-50 data-active:font-semibold data-active:text-secondary-600 group-data-[collapsible=icon]:size-11! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0! [&_svg]:size-5"
                    >
                      <Link to={to} aria-current={active ? "page" : undefined}>
                        <Icon aria-hidden="true" />
                        <span className="group-data-[collapsible=icon]:hidden">{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-4 px-4 pb-6 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-3">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={disclaimer}
                className="flex size-11 items-center justify-center rounded-xl border border-success bg-success-soft text-success focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <Info aria-hidden="true" className="size-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-56">
              {disclaimer}
            </TooltipContent>
          </Tooltip>
        ) : (
          <div
            role="note"
            className="flex items-start gap-2.5 rounded-xl border border-success bg-success-soft p-3"
          >
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-success" />
            <p className="text-b9 text-ink">{disclaimer}</p>
          </div>
        )}

        <SidebarSeparator className="mx-0 w-full" />

        <div className="flex items-center gap-3 group-data-[collapsible=icon]:flex-col">
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100"
                aria-hidden={!collapsed}
                aria-label={collapsed ? doctorName : undefined}
                role={collapsed ? "img" : undefined}
              >
                <Stethoscope aria-hidden="true" className="size-5 text-primary-600" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" hidden={!collapsed}>
              {doctorName}
            </TooltipContent>
          </Tooltip>

          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sh8 text-ink">{doctorName}</p>
            <p className="text-b9 text-ink-muted">Dokter</p>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={onSignOut}
                disabled={signingOut}
                aria-label="Keluar"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-sunken hover:text-primary-600 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
              >
                <LogOut aria-hidden="true" className="size-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Keluar</TooltipContent>
          </Tooltip>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
