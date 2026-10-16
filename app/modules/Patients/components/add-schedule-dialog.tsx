import { ChevronDown, CircleAlert, Clock, Loader2, Plus, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { formatClockTime } from "~/lib/date";
import {
  MAX_TIMES_PER_DAY,
  isEndBeforeStart,
  toLocalDateKey,
  validateTimes,
  type TimesError,
} from "~/lib/medication";
import { useMedicines } from "~/modules/Medicines";
import { useAddSchedule } from "../hooks";
import { scheduleErrorText } from "../schedule-error-text";
import type { NewScheduleInput } from "../types";

const TEXT_MAX = 1000;

type FieldErrors = Partial<Record<keyof NewScheduleInput, string>>;

const timesErrorText: Record<TimesError, string> = {
  required: "Tambahkan minimal satu jam minum.",
  too_many: "Maksimal 8 jam minum per hari.",
  invalid: "Format jam tidak valid.",
  duplicate: "Jam ini sudah ada.",
};

function emptyValues(): NewScheduleInput {
  return {
    medicineId: "",
    dose: "",
    times: [],
    startDate: toLocalDateKey(new Date()),
    endDate: "",
    instructions: "",
  };
}

function validate(values: NewScheduleInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.medicineId) errors.medicineId = "Pilih obat.";
  if (!values.dose.trim()) errors.dose = "Dosis per minum wajib diisi.";
  else if (values.dose.trim().length > TEXT_MAX) errors.dose = "Dosis per minum maksimal 1000 karakter.";
  const timesError = validateTimes(values.times);
  if (timesError) errors.times = timesErrorText[timesError];
  if (!values.startDate) errors.startDate = "Tanggal mulai wajib diisi.";
  if (values.startDate && isEndBeforeStart(values.startDate, values.endDate || null)) {
    errors.endDate = "Tanggal selesai tidak boleh sebelum tanggal mulai.";
  }
  if (values.instructions.trim().length > TEXT_MAX) errors.instructions = "Instruksi maksimal 1000 karakter.";
  return errors;
}

type AddScheduleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patientName: string;
};

const fieldClassName = "px-3 text-b7 md:text-b7";

export function AddScheduleDialog({ open, onOpenChange, patientId, patientName }: AddScheduleDialogProps) {
  const [values, setValues] = useState<NewScheduleInput>(emptyValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [newTime, setNewTime] = useState("");
  // TODO: the shared catalog's first page only (20 medicines); add search when it grows.
  const medicines = useMedicines({ search: "", page: 1 });
  const addSchedule = useAddSchedule(patientId);

  function handleOpenChange(nextOpen: boolean) {
    // Keep the dialog open while saving so the result is not lost.
    if (!nextOpen && addSchedule.isPending) return;
    if (!nextOpen) {
      setValues(emptyValues());
      setErrors({});
      setNewTime("");
      addSchedule.reset();
    }
    onOpenChange(nextOpen);
  }

  function update<K extends keyof NewScheduleInput>(field: K, value: NewScheduleInput[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors(({ [field]: _cleared, ...rest }) => rest);
  }

  function addTime() {
    if (!newTime) return;
    if (values.times.includes(newTime)) {
      setErrors((current) => ({ ...current, times: timesErrorText.duplicate }));
      return;
    }
    if (values.times.length >= MAX_TIMES_PER_DAY) {
      setErrors((current) => ({ ...current, times: timesErrorText.too_many }));
      return;
    }
    // Times are kept ascending, as the schedule rules require.
    update("times", [...values.times, newTime].sort());
    setNewTime("");
  }

  function removeTime(time: string) {
    update(
      "times",
      values.times.filter((value) => value !== time),
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    addSchedule.mutate(values, {
      onSuccess: () => {
        toast.success("Jadwal ditambahkan.");
        setValues(emptyValues());
        setNewTime("");
        addSchedule.reset();
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-dvh gap-0 overflow-y-auto rounded-2xl p-6 sm:max-w-lg sm:p-7">
        <DialogHeader>
          <DialogTitle className="text-h5 text-primary-600">Tambah Jadwal</DialogTitle>
          <DialogDescription className="text-b9 text-ink-muted">Untuk {patientName}</DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          {addSchedule.error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-danger bg-danger-soft p-3"
            >
              <CircleAlert aria-hidden="true" className="mt-0.5 size-4.5 shrink-0 text-danger" />
              <p className="text-b8 text-danger">{scheduleErrorText(addSchedule.error.code)}</p>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="schedule-medicine" className="text-sh8 text-ink">
              Obat
            </Label>
            <div className="relative">
              <select
                id="schedule-medicine"
                value={values.medicineId}
                onChange={(event) => update("medicineId", event.target.value)}
                aria-invalid={errors.medicineId ? true : undefined}
                aria-describedby={errors.medicineId ? "schedule-medicine-error" : "schedule-medicine-hint"}
                className="h-11 w-full appearance-none rounded-lg border border-input bg-surface-raised pr-9 pl-3 text-b7 text-ink focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none aria-invalid:border-destructive"
              >
                <option value="">Pilih dari Daftar Obat</option>
                {medicines.data?.items.map((medicine) => (
                  <option key={medicine.id} value={medicine.id}>
                    {medicine.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
              />
            </div>
            <p id="schedule-medicine-hint" className="text-b9 text-ink-muted">
              Obat belum ada?{" "}
              <Link to="/medicines" className="text-sh9 text-primary-600 hover:underline">
                Tambah Obat
              </Link>
            </p>
            {errors.medicineId && (
              <p id="schedule-medicine-error" className="text-b9 text-danger">
                {errors.medicineId}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="schedule-dose" className="text-sh8 text-ink">
              Dosis per minum
            </Label>
            <Input
              id="schedule-dose"
              placeholder="Contoh: 1 tablet"
              value={values.dose}
              onChange={(event) => update("dose", event.target.value)}
              aria-invalid={errors.dose ? true : undefined}
              aria-describedby={errors.dose ? "schedule-dose-error" : undefined}
              className={`h-11 ${fieldClassName}`}
            />
            {errors.dose && (
              <p id="schedule-dose-error" className="text-b9 text-danger">
                {errors.dose}
              </p>
            )}
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sh8 text-ink">Jam minum</legend>
            <div className="flex flex-wrap items-center gap-2">
              {values.times.map((time) => (
                <span
                  key={time}
                  className="inline-flex items-center gap-1 rounded-full bg-primary-50 py-1 pr-1 pl-3 text-sh9 text-primary-700"
                >
                  {formatClockTime(time)}
                  <button
                    type="button"
                    onClick={() => removeTime(time)}
                    aria-label={`Hapus jam ${formatClockTime(time)}`}
                    className="flex size-5 items-center justify-center rounded-full hover:bg-primary-100 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  >
                    <X aria-hidden="true" className="size-3.5" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-2">
                <label className="relative">
                  <span className="sr-only">Jam baru</span>
                  <Clock
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-muted"
                  />
                  <Input
                    type="time"
                    value={newTime}
                    onChange={(event) => setNewTime(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addTime();
                      }
                    }}
                    className="h-9 w-32 pl-8 text-b8 md:text-b8"
                  />
                </label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTime}
                  disabled={!newTime || values.times.length >= MAX_TIMES_PER_DAY}
                  className="h-9 gap-1.5 border px-3 text-sh9"
                >
                  <Plus aria-hidden="true" className="size-4" />
                  Tambah jam
                </Button>
              </div>
            </div>
            <p className="text-b9 text-ink-muted">1–8 jam per hari, waktu setempat pasien.</p>
            {errors.times && <p className="text-b9 text-danger">{errors.times}</p>}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="schedule-start" className="text-sh8 text-ink">
                Tanggal mulai
              </Label>
              <Input
                id="schedule-start"
                type="date"
                value={values.startDate}
                onChange={(event) => update("startDate", event.target.value)}
                aria-invalid={errors.startDate ? true : undefined}
                aria-describedby={errors.startDate ? "schedule-start-error" : undefined}
                className={`h-11 ${fieldClassName}`}
              />
              {errors.startDate && (
                <p id="schedule-start-error" className="text-b9 text-danger">
                  {errors.startDate}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="schedule-end" className="text-sh8 text-ink">
                Tanggal selesai <span className="text-b8 text-ink-muted">(opsional)</span>
              </Label>
              <Input
                id="schedule-end"
                type="date"
                min={values.startDate || undefined}
                value={values.endDate}
                onChange={(event) => update("endDate", event.target.value)}
                aria-invalid={errors.endDate ? true : undefined}
                aria-describedby={errors.endDate ? "schedule-end-error" : "schedule-end-hint"}
                className={`h-11 ${fieldClassName}`}
              />
              {errors.endDate ? (
                <p id="schedule-end-error" className="text-b9 text-danger">
                  {errors.endDate}
                </p>
              ) : (
                <p id="schedule-end-hint" className="text-b9 text-ink-muted">
                  Kosongkan untuk tanpa batas.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="schedule-instructions" className="text-sh8 text-ink">
              Instruksi <span className="text-b8 text-ink-muted">(opsional)</span>
            </Label>
            <Textarea
              id="schedule-instructions"
              placeholder="Contoh: sesudah makan"
              rows={3}
              value={values.instructions}
              onChange={(event) => update("instructions", event.target.value)}
              aria-invalid={errors.instructions ? true : undefined}
              aria-describedby={errors.instructions ? "schedule-instructions-error" : undefined}
              className={`min-h-20 ${fieldClassName}`}
            />
            {errors.instructions && (
              <p id="schedule-instructions-error" className="text-b9 text-danger">
                {errors.instructions}
              </p>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={addSchedule.isPending}
                className="h-11 px-5 text-sh8"
              >
                Batal
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={addSchedule.isPending}
              aria-busy={addSchedule.isPending}
              className="h-11 gap-2 px-5 text-sh8"
            >
              {addSchedule.isPending && <Loader2 aria-hidden="true" className="size-4.5 animate-spin" />}
              Simpan Jadwal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
