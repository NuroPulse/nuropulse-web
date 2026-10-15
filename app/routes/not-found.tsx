import type { Route } from "./+types/not-found";
import { NotFoundPage } from "~/modules/NotFound";
import { hasActiveSession } from "~/modules/Auth";

export async function clientLoader() {
  return { isSignedIn: await hasActiveSession() };
}

export function meta({}: Route.MetaArgs) {
  return [{ title: "Halaman tidak ditemukan | NuroPulse" }];
}

export default function NotFoundRoute({ loaderData }: Route.ComponentProps) {
  return <NotFoundPage isSignedIn={loaderData.isSignedIn} />;
}

