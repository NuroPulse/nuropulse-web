import { redirect } from "react-router";

import { queryClient } from "~/lib/query-client";
import { getProfile, getSession, signOut } from "./api";
import { clearProfileCache, profileQueryKeys } from "./hooks";
import type { Profile } from "./types";

// The only place that decides who may enter the dashboard.
// Route clientLoaders call these; components never check the session themselves.

function fetchProfile(userId: string) {
  return queryClient.ensureQueryData({
    queryKey: profileQueryKeys.byUser(userId),
    queryFn: () => getProfile(userId),
  });
}

export async function requireDoctor(): Promise<Profile> {
  const session = await getSession();
  if (!session) throw redirect("/login");

  const profile = await fetchProfile(session.user.id);
  if (profile?.role === "doctor") return profile;

  clearProfileCache();
  try {
    // Finish signing out before redirecting so /login does not see a live session.
    await signOut();
  } catch {
    // A failed sign-out (offline) leaves the session in place; that is still safe:
    // /login only redirects doctors, so this cannot loop back here.
  }
  throw redirect("/login?reason=not-doctor");
}

export async function redirectIfDoctor(): Promise<null> {
  const session = await getSession();
  if (!session) return null;

  let profile: Profile | null;
  try {
    profile = await fetchProfile(session.user.id);
  } catch {
    // Public pages must stay reachable when the profile cannot be loaded.
    return null;
  }
  if (profile?.role === "doctor") throw redirect("/dashboard");
  return null;
}
