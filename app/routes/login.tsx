import type { Route } from "./+types/login";
import { LoginPage } from "~/modules/Auth";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Masuk | NuroPulse" }];
}

export default function LoginRoute() {
  return <LoginPage />;
}
