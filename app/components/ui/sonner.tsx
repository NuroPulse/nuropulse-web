import { CircleAlert, CircleCheck, Info, Loader2, TriangleAlert } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

// Light-only Toaster styled with design tokens. Unlike the shadcn registry version, it
// needs no next-themes and no inline style; sonner still handles position and motion.
// Call `toast(...)` / `toast.success(...)` from "sonner" anywhere in the app.
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="bottom-right"
      containerAriaLabel="Notifikasi"
      icons={{
        success: <CircleCheck aria-hidden="true" className="size-5 text-secondary-600" />,
        info: <Info aria-hidden="true" className="size-5 text-primary-600" />,
        warning: <TriangleAlert aria-hidden="true" className="size-5 text-warning" />,
        error: <CircleAlert aria-hidden="true" className="size-5 text-danger" />,
        loading: <Loader2 aria-hidden="true" className="size-5 animate-spin text-primary-600" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-center gap-3 rounded-xl border border-line bg-surface-raised p-4 shadow-card",
          title: "text-sh8 text-ink",
          description: "text-b9 text-ink-muted",
          icon: "flex shrink-0 items-center",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
