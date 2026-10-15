import type { Route } from "./+types/landing";
import { redirectIfDoctor } from "~/modules/Auth";
import { LandingPage } from "~/modules/LandingPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NuroPulse" },
    { name: "description", content: "Dashboard pemantauan tremor untuk neurolog." },
  ];
}

export async function clientLoader() {
  return redirectIfDoctor();
}

export default function LandingRoute() {
  return <LandingPage />;
}
