import type { Route } from "./+types/login";
import { LoginPage, redirectIfDoctor } from "~/modules/Auth";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Masuk — NuroPulse" }];
}

export async function clientLoader() {
  return redirectIfDoctor();
}

export default function LoginRoute() {
  return <LoginPage />;
}
