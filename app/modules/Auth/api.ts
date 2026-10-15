import {
  isAuthApiError,
  isAuthRetryableFetchError,
  isAuthWeakPasswordError,
  type Session,
} from "@supabase/supabase-js";

import { supabase } from "~/lib/supabase";
import {
  AuthFailure,
  type Profile,
  type SignInInput,
  type SignUpInput,
  type SignUpResult,
} from "./types";
import { normalizePhoneNumber } from "./validation";

function toAuthFailure(error: unknown): AuthFailure {
  if (typeof navigator !== "undefined" && !navigator.onLine) return new AuthFailure("network");
  if (isAuthRetryableFetchError(error)) return new AuthFailure("network");
  if (isAuthWeakPasswordError(error)) return new AuthFailure("weak_password");
  if (isAuthApiError(error)) {
    switch (error.code) {
      case "invalid_credentials":
        return new AuthFailure("invalid_credentials");
      case "user_already_exists":
      case "email_exists":
        return new AuthFailure("email_taken");
      case "weak_password":
        return new AuthFailure("weak_password");
    }
  }
  // fetch() rejects with a TypeError when the network is unreachable.
  if (error instanceof TypeError) return new AuthFailure("network");
  return new AuthFailure("unknown");
}

export async function signIn({ email, password }: SignInInput): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw toAuthFailure(error);
}

export async function signUp({
  fullName,
  phoneNumber,
  email,
  password,
}: SignUpInput): Promise<SignUpResult> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      // The backend trigger creates the profile from this metadata:
      // signup_source "web" gives role = doctor and a connection code.
      data: {
        full_name: fullName.trim(),
        phone: normalizePhoneNumber(phoneNumber),
        signup_source: "web",
      },
    },
  });
  if (error) throw toAuthFailure(error);
  // With email confirmation on, Supabase hides an existing email behind a user with no identities.
  if (data.user && data.user.identities?.length === 0) throw new AuthFailure("email_taken");
  return { hasSession: data.session !== null };
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw toAuthFailure(error);
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw toAuthFailure(error);
  return data.session;
}

// Reads the signed-in user's own profile. Returns null when no row exists for them.
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw toAuthFailure(error);
  if (!data) return null;
  return { id: data.id, role: data.role, fullName: data.full_name };
}
