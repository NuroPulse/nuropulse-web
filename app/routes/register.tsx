import type { Route } from "./+types/register";
import { RegisterPage } from "~/modules/Auth";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Daftar | NuroPulse" }];
}

export default function RegisterRoute() {
  return <RegisterPage />;
}
