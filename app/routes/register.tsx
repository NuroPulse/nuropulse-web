import type { Route } from "./+types/register";
import { RegisterPage, redirectIfDoctor } from "~/modules/Auth";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Daftar — NuroPulse" }];
}

export async function clientLoader() {
  return redirectIfDoctor();
}

export default function RegisterRoute() {
  return <RegisterPage />;
}
