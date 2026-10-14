import type { Route } from "./+types/not-found";
import { NotFoundPage } from "~/modules/NotFound";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Halaman tidak ditemukan | NuroPulse" }];
}

export default function NotFoundRoute() {
  return <NotFoundPage />;
}
