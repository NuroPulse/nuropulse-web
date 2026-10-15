import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useNavigate } from "react-router";

import { queryClient } from "~/lib/query-client";
import { supabase } from "~/lib/supabase";
import { signIn, signUp } from "./api";
import type { AuthFailure, SignInInput, SignUpInput, SignUpResult } from "./types";

export const profileQueryKeys = {
  all: ["auth", "profile"] as const,
  byUser: (userId: string) => ["auth", "profile", userId] as const,
};

export function clearProfileCache() {
  queryClient.removeQueries({ queryKey: profileQueryKeys.all });
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
