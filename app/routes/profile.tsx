import type { Route } from "./+types/profile";
import { ProfilePage } from "~/modules/Profile";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Profil Saya | NuroPulse" }];
}

export default function ProfileRoute() {
  return <ProfilePage />;
}
