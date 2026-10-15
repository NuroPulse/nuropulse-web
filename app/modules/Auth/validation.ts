import type { FieldErrors, SignInInput, SignUpInput } from "./types";

// Matches Supabase Auth's default minimum password length.
export const MIN_PASSWORD_LENGTH = 6;

// Deliberately loose: Supabase does the authoritative check.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// International (E.164) format: "+", country code, then the number; 8 to 15 digits in total.
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

// Spaces, dashes, dots and brackets are common when typing a number; drop them before checking.
export function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/[\s().-]/g, "");
}

function checkEmail(email: string) {
  if (!email.trim()) return "required" as const;
  if (!EMAIL_PATTERN.test(email.trim())) return "email_invalid" as const;
  return undefined;
}

function checkPhoneNumber(phoneNumber: string) {
  const normalized = normalizePhoneNumber(phoneNumber);
  if (!normalized) return "required" as const;
  if (!PHONE_PATTERN.test(normalized)) return "phone_invalid" as const;
  return undefined;
}

function checkPassword(password: string) {
  if (!password) return "required" as const;
  if (password.length < MIN_PASSWORD_LENGTH) return "password_too_short" as const;
  return undefined;
}

function withoutEmpty<Field extends string>(errors: FieldErrors<Field>): FieldErrors<Field> {
  return Object.fromEntries(
    Object.entries(errors).filter(([, code]) => code !== undefined),
  ) as FieldErrors<Field>;
}

export function validateSignIn(values: SignInInput): FieldErrors<keyof SignInInput> {
  return withoutEmpty({
    email: checkEmail(values.email),
    password: checkPassword(values.password),
  });
}

export function validateSignUp(values: SignUpInput): FieldErrors<keyof SignUpInput> {
  return withoutEmpty({
    fullName: values.fullName.trim() ? undefined : "required",
    phoneNumber: checkPhoneNumber(values.phoneNumber),
    email: checkEmail(values.email),
    password: checkPassword(values.password),
  });
}

export function hasFieldErrors(errors: object): boolean {
  return Object.keys(errors).length > 0;
}
