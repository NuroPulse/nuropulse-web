export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = {
  fullName: string;
  // WhatsApp number in international format, for example +6281234567890.
  phoneNumber: string;
  email: string;
  password: string;
};

export type SignUpResult = {
  // False when Supabase created the account but did not start a session.
  hasSession: boolean;
};

export type Profile = {
  id: string;
  // Plain text in the database; only "doctor" may use this dashboard.
  role: string;
  fullName: string;
};

export type AuthErrorCode =
  | "invalid_credentials"
  | "email_taken"
  | "weak_password"
  | "network"
  | "unknown";

// Typed error thrown by api.ts; the UI maps `code` to Indonesian text.
export class AuthFailure extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode) {
    super(code);
    this.name = "AuthFailure";
    this.code = code;
  }
}

export type FieldErrorCode = "required" | "email_invalid" | "phone_invalid" | "password_too_short";

export type FieldErrors<Field extends string> = Partial<Record<Field, FieldErrorCode>>;
