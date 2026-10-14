import type { Route } from "./+types/landing";
import { LandingPage } from "~/modules/LandingPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "NuroPulse" },
    { name: "description", content: "Dashboard pemantauan tremor untuk neurolog." },
  ];
}

// TODO: redirect a signed-in doctor to /dashboard once the Supabase schema
// (profiles.role) has been checked against CLAUDE.md Section 4.
export default function LandingRoute() {
  return <LandingPage />;
}
