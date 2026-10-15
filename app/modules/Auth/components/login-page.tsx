import { CircleAlert, CircleCheck, Loader2, TriangleAlert } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useSignIn } from "../hooks";
import type { AuthErrorCode, FieldErrorCode, FieldErrors, SignInInput } from "../types";
import { hasFieldErrors, validateSignIn } from "../validation";
import { AuthLayout } from "./auth-layout";
import { PasswordInput } from "./password-input";

type Field = keyof SignInInput;

function fieldErrorText(field: Field, code: FieldErrorCode): string {
  if (field === "email") {
    return code === "email_invalid" ? "Format email tidak valid." : "Email wajib diisi.";
  }
  return code === "password_too_short"
    ? "Kata sandi minimal 6 karakter."
    : "Kata sandi wajib diisi.";
}

function serverErrorText(code: AuthErrorCode): string {
  switch (code) {
    case "invalid_credentials":
      return "Email atau kata sandi tidak sesuai.";
    case "network":
      return "Tidak ada koneksi internet. Coba lagi.";
    default:
      return "Terjadi kesalahan. Silakan coba lagi.";
  }
}

const inputClassName = "h-11 px-3 text-b7 md:text-b7";

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const [values, setValues] = useState<SignInInput>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const signIn = useSignIn();

  const notDoctor = searchParams.get("reason") === "not-doctor";
  const registered = searchParams.get("registered") === "1";

  function updateField(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors(({ [field]: _cleared, ...rest }) => rest);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateSignIn(values);
    setErrors(nextErrors);
    if (hasFieldErrors(nextErrors)) return;
    signIn.mutate(values);
  }

  return (
    <AuthLayout>
      <h1 className="text-center text-h4 tracking-tight text-primary-600">Masuk</h1>
      <p className="mt-2 text-center text-b8 text-ink-muted">
        Khusus untuk dokter. Pasien menggunakan aplikasi NuroPulse.
      </p>

      {notDoctor && (
        <div
          role="alert"
          className="mt-6 flex items-start gap-3 rounded-xl border border-warning bg-warning-soft p-3"
        >
          <TriangleAlert aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-warning" />
          <p className="text-b8 text-ink">
            Dashboard ini hanya untuk neurolog. Gunakan aplikasi NuroPulse untuk pasien.
          </p>
        </div>
      )}
      {registered && (
        <div
          role="status"
          className="mt-6 flex items-start gap-3 rounded-xl border border-secondary-600 bg-secondary-50 p-3"
        >
          <CircleCheck aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-secondary-700" />
          <p className="text-b8 text-ink">Akun berhasil dibuat. Silakan masuk.</p>
        </div>
      )}

      <form noValidate onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        {signIn.error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-3"
          >
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-danger" />
            <p className="text-b8 text-danger">{serverErrorText(signIn.error.code)}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="login-email" className="text-sh8">
            Email
          </Label>
          <Input
            id="login-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "login-email-error" : undefined}
            className={inputClassName}
          />
          {errors.email && (
            <p id="login-email-error" className="text-b9 text-danger">
              {fieldErrorText("email", errors.email)}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="login-password" className="text-sh8">
            Kata sandi
          </Label>
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            value={values.password}
            onChange={(event) => updateField("password", event.target.value)}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "login-password-error" : undefined}
            className={inputClassName}
          />
          {errors.password && (
            <p id="login-password-error" className="text-b9 text-danger">
              {fieldErrorText("password", errors.password)}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={signIn.isPending}
          aria-busy={signIn.isPending}
          className="mt-2 h-12 w-full gap-2 text-h7"
        >
          {signIn.isPending && <Loader2 aria-hidden="true" className="size-4.5 animate-spin" />}
          Masuk
        </Button>
      </form>

      <p className="mt-6 text-center text-b8 text-ink-muted">
        Belum punya akun?{" "}
        <Link
          to="/register"
          className="text-sh8 text-primary-600 underline-offset-4 hover:underline"
        >
          Daftar
        </Link>
      </p>
    </AuthLayout>
  );
}
