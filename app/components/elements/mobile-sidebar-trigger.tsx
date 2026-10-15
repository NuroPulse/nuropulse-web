import { Menu } from "lucide-react";

import { useSidebar } from "~/components/ui/sidebar";

// Below the md breakpoint the sidebar becomes a slide-in sheet; this opens it.
export function MobileSidebarTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex items-center border-b border-line bg-surface-raised px-4 py-2 md:hidden">
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label="Buka menu"
        className="flex size-10 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-sunken hover:text-primary-600 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>
    </div>
  );
}
