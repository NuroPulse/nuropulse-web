import type { PatientErrorCode } from "./types";

// One owner for the schedule failure messages, shared by the add, edit, and stop dialogs.
export function scheduleErrorText(code: PatientErrorCode): string {
  switch (code) {
    case "network":
      return "Tidak ada koneksi internet. Coba lagi.";
    case "forbidden":
      return "Pasien ini tidak terhubung dengan Anda.";
    case "schedule_invalid_times":
      return "Format jam tidak valid.";
    case "schedule_invalid_range":
      return "Tanggal selesai tidak boleh sebelum tanggal mulai.";
    case "unknown":
      return "Terjadi kesalahan. Silakan coba lagi.";
  }
}
