import type { Route } from "./+types/dashboard";
import { OverviewPage } from "~/modules/Dashboard";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Dashboard | NuroPulse" }];
}

export default function DashboardRoute() {
  return <OverviewPage />;
}
