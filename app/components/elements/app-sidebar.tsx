import { NavLink } from "react-router";

import { cn } from "~/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/patients", label: "Daftar Pasien" },
  { to: "/medicines", label: "Daftar Obat" },
  { to: "/profile", label: "Profil Saya" },
];

export function AppSidebar() {
  return (
    <aside className="w-60 shrink-0 border-r border-sidebar-border bg-sidebar p-4 text-sidebar-foreground">
      <p className="mb-6 text-sh6">NuroPulse</p>
      <nav>
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "block rounded-md px-3 py-2 text-b8 hover:bg-sidebar-accent",
                    isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
