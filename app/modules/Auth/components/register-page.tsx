import { CircleAlert, Loader2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useSignUp } from "../hooks";
import type { AuthErrorCode, FieldErrorCode, FieldErrors, SignUpInput } from "../types";
import { hasFieldErrors, validateSignUp } from "../validation";
import { AuthLayout } from "./auth-layout";
import { PasswordInput } from "./password-input";

type Field = keyof SignUpInput;

function fieldErrorText(field: Field, code: FieldErrorCode): string {
  switch (field) {
    case "fullName":
      return "Nama lengkap wajib diisi.";
    case "phoneNumber":
      return code === "phone_invalid"
        ? "Gunakan format internasional, contoh +6281234567890."
        : "Nomor telepon wajib diisi.";
    case "email":
      return code === "email_invalid" ? "Format email tidak valid." : "Email wajib diisi.";
    case "password":
      return code === "password_too_short"
        ? "Kata sandi minimal 6 karakter."
        : "Kata sandi wajib diisi.";
  }
}

function serverErrorText(code: AuthErrorCode): string {
  switch (code) {
    case "email_taken":
      return "Email ini sudah terdaftar. Silakan masuk.";
    case "weak_password":
      return "Kata sandi terlalu lemah. Gunakan kata sandi yang lebih panjang dengan campuran huruf dan angka.";
    case "network":
      return "Tidak ada koneksi internet. Coba lagi.";
    default:
      return "Terjadi kesalahan. Silakan coba lagi.";
  }
}

const inputClassName = "h-11 px-3 text-b7 md:text-b7";

export function RegisterPage() {
  const [values, setValues] = useState<SignUpInput>({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FieldErrors<Field>>({});
  const signUp = useSignUp();

  function updateField(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors(({ [field]: _cleared, ...rest }) => rest);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateSignUp(values);
    setErrors(nextErrors);
    if (hasFieldErrors(nextErrors)) return;
    signUp.mutate(values);
  }

  return (
    <AuthLayout>
      <h1 className="text-center text-h4 tracking-tight text-primary-600">Daftar sebagai dokter</h1>

      <form noValidate onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        {signUp.error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-3"
          >
            <CircleAlert aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-danger" />
            <p className="text-b8 text-danger">{serverErrorText(signUp.error.code)}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Label htmlFor="register-full-name" className="text-sh8">
            Nama lengkap
          </Label>
          <Input
            id="register-full-name"
            autoComplete="name"
            placeholder="Jika Maka, Sp.N"
            value={values.fullName}
            onChange={(event) => updateField("fullName", event.target.value)}
            aria-invalid={errors.fullName ? true : undefined}
            aria-describedby={errors.fullName ? "register-full-name-error" : undefined}
            className={inputClassName}
          />
          {errors.fullName && (
            <p id="register-full-name-error" className="text-b9 text-danger">
              {fieldErrorText("fullName", errors.fullName)}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="register-phone-number" className="text-sh8">
            Nomor telepon
          </Label>
          <Input
            id="register-phone-number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+6281234567890"
            value={values.phoneNumber}
            onChange={(event) => updateField("phoneNumber", event.target.value)}
            aria-invalid={errors.phoneNumber ? true : undefined}
            aria-describedby={
              errors.phoneNumber
                ? "register-phone-number-hint register-phone-number-error"
                : "register-phone-number-hint"
            }
            className={inputClassName}
          />
          <p id="register-phone-number-hint" className="text-b9 text-ink-muted">
            Nomor WhatsApp yang aktif, diawali kode telepon +62.
          </p>
          {errors.phoneNumber && (
            <p id="register-phone-number-error" className="text-b9 text-danger">
              {fieldErrorText("phoneNumber", errors.phoneNumber)}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="register-email" className="text-sh8">
            Email
          </Label>
          <Input
            id="register-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="jikamaka@gmail.com"
            value={values.email}
            onChange={(event) => updateField("email", event.target.value)}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "register-email-error" : undefined}
            className={inputClassName}
          />
          {errors.email && (
            <p id="register-email-error" className="text-b9 text-danger">
              {fieldErrorText("email", errors.email)}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="register-password" className="text-sh8">
            Kata sandi
          </Label>
          <PasswordInput
            id="register-password"
            autoComplete="new-password"
            value={values.password}
            onChange={(event) => updateField("password", event.target.value)}
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={
              errors.password
                ? "register-password-hint register-password-error"
                : "register-password-hint"
            }
            className={inputClassName}
          />
          <p id="register-password-hint" className="text-b9 text-ink-muted">
            Minimal 8 karakter. Sebaiknya gabungkan huruf dan angka.
          </p>
          {errors.password && (
            <p id="register-password-error" className="text-b9 text-danger">
              {fieldErrorText("password", errors.password)}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={signUp.isPending}
          aria-busy={signUp.isPending}
          className="mt-2 h-12 w-full gap-2 text-h7"
        >
          {signUp.isPending && <Loader2 aria-hidden="true" className="size-4.5 animate-spin" />}
          Daftar
        </Button>
      </form>

      <p className="mt-6 text-center text-b8 text-ink-muted">
        Sudah punya akun?{" "}
        <Link to="/login" className="text-sh8 text-primary-600 underline-offset-4 hover:underline">
          Masuk
        </Link>
      </p>
    </AuthLayout>
  );
}
