import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { queryClient } from "~/lib/query-client";
import { supabase } from "~/lib/supabase";
import { getProfile, getSession, signIn, signOut, signUp } from "./api";
import {
  AuthFailure,
  type CurrentAccount,
  type SignInInput,
  type SignUpInput,
  type SignUpResult,
} from "./types";

export const profileQueryKeys = {
  all: ["auth", "profile"] as const,
  byUser: (userId: string) => ["auth", "profile", userId] as const,
  currentAccount: ["auth", "profile", "current-account"] as const,
};

export function clearProfileCache() {
  queryClient.removeQueries({ queryKey: profileQueryKeys.all });
}

// The signed-in doctor's profile and login email. Reuses the profile the route guard
// already cached under profileQueryKeys.byUser, so it does not query profiles twice.
export function useCurrentAccount() {
  return useQuery<CurrentAccount, AuthFailure>({
    queryKey: profileQueryKeys.currentAccount,
    queryFn: async () => {
      const session = await getSession();
      if (!session) throw new AuthFailure("unknown");
      const profile = await queryClient.ensureQueryData({
        queryKey: profileQueryKeys.byUser(session.user.id),
        queryFn: () => getProfile(session.user.id),
      });
      if (!profile) throw new AuthFailure("unknown");
      return { email: session.user.email ?? null, profile };
    },
  });
}

export function useSignIn() {
  const navigate = useNavigate();
  return useMutation<void, AuthFailure, SignInInput>({
    mutationFn: signIn,
    // The /dashboard guard checks the role, so a non-doctor is signed out there.
    onSuccess: () => navigate("/dashboard", { replace: true }),
  });
}

export function useSignUp() {
  const navigate = useNavigate();
  return useMutation<SignUpResult, AuthFailure, SignUpInput>({
    mutationFn: signUp,
    onSuccess: ({ hasSession }) =>
      navigate(hasSession ? "/dashboard" : "/login?registered=1", { replace: true }),
  });
}

export function useSignOut() {
  const navigate = useNavigate();
  return useMutation<void, AuthFailure>({
    mutationFn: signOut,
    onSuccess: () => {
      clearProfileCache();
      navigate("/login", { replace: true });
    },
  });
}

// Mount only inside protected pages: a sign-out from anywhere (another tab,
// an expired refresh token, the "Keluar" button) sends the doctor to /login.
export function useSignOutRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_OUT") return;
      clearProfileCache();
      navigate("/login", { replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);
}
