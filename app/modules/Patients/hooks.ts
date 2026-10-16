import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSchedule,
  getLatestMeasurement,
  getPatient,
  listMeasurementHistory,
  listMedicationLogs,
  listTrendMeasurements,
  listMyPatients,
  listSchedules,
  stopSchedule,
  updateSchedule,
} from "./api";
import type {
  Measurement,
  MeasurementPage,
  MedicationLog,
  MedicationSchedule,
  NewScheduleInput,
  PatientFailure,
  PatientListItem,
  ScheduleChanges,
} from "./types";

export const patientQueryKeys = {
  all: ["patients"] as const,
  list: () => [...patientQueryKeys.all, "list"] as const,
  detail: (id: string) => [...patientQueryKeys.all, "detail", id] as const,
  schedules: (id: string) => [...patientQueryKeys.all, "schedules", id] as const,
  medicationLogs: (id: string) => [...patientQueryKeys.all, "medication-logs", id] as const,
  measurements: (id: string) => [...patientQueryKeys.all, "measurements", id] as const,
  latestMeasurement: (id: string) => [...patientQueryKeys.measurements(id), "latest"] as const,
  trendMeasurements: (id: string) => [...patientQueryKeys.measurements(id), "trend"] as const,
  measurementHistory: (id: string, page: number) =>
    [...patientQueryKeys.measurements(id), "history", page] as const,
};

export function useLatestMeasurement(patientId: string) {
  return useQuery<Measurement | null, PatientFailure>({
    queryKey: patientQueryKeys.latestMeasurement(patientId),
    queryFn: () => getLatestMeasurement(patientId),
  });
}

export function useTrendMeasurements(patientId: string) {
  return useQuery<Measurement[], PatientFailure>({
    queryKey: patientQueryKeys.trendMeasurements(patientId),
    queryFn: () => listTrendMeasurements(patientId),
  });
}

export function useMeasurementHistory(patientId: string, page: number) {
  return useQuery<MeasurementPage, PatientFailure>({
    queryKey: patientQueryKeys.measurementHistory(patientId, page),
    queryFn: () => listMeasurementHistory(patientId, page),
    // Keep the current page visible while the next one loads.
    placeholderData: keepPreviousData,
  });
}

// Flags and compliance change as time passes (a dose becomes "missed", the 7-day window moves),
// not only when data arrives, so open pages recompute them on this interval.
const DERIVED_REFRESH_MS = 60_000;

// Shared by the patient list and the Dashboard overview, so both read the same numbers.
export function useMyPatients() {
  return useQuery<PatientListItem[], PatientFailure>({
    queryKey: patientQueryKeys.list(),
    queryFn: listMyPatients,
    refetchInterval: DERIVED_REFRESH_MS,
  });
}

export function usePatient(patientId: string) {
  return useQuery<PatientListItem | null, PatientFailure>({
    queryKey: patientQueryKeys.detail(patientId),
    queryFn: () => getPatient(patientId),
    refetchInterval: DERIVED_REFRESH_MS,
  });
}

export function useSchedules(patientId: string) {
  return useQuery<MedicationSchedule[], PatientFailure>({
    queryKey: patientQueryKeys.schedules(patientId),
    queryFn: () => listSchedules(patientId),
  });
}

export function useMedicationLogs(patientId: string) {
  return useQuery<MedicationLog[], PatientFailure>({
    queryKey: patientQueryKeys.medicationLogs(patientId),
    queryFn: () => listMedicationLogs(patientId),
  });
}

// A schedule change can change the patient's medication compliance and flag too.
function useInvalidateSchedules(patientId: string) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: patientQueryKeys.schedules(patientId) }),
      queryClient.invalidateQueries({ queryKey: patientQueryKeys.detail(patientId) }),
      queryClient.invalidateQueries({ queryKey: patientQueryKeys.list() }),
    ]);
}

export function useAddSchedule(patientId: string) {
  const invalidate = useInvalidateSchedules(patientId);
  return useMutation<MedicationSchedule, PatientFailure, NewScheduleInput>({
    mutationFn: (input) => createSchedule(patientId, input),
    onSuccess: invalidate,
  });
}

export function useUpdateSchedule(patientId: string) {
  const invalidate = useInvalidateSchedules(patientId);
  return useMutation<MedicationSchedule, PatientFailure, { scheduleId: string; changes: ScheduleChanges }>({
    mutationFn: ({ scheduleId, changes }) => updateSchedule(scheduleId, changes),
    onSuccess: invalidate,
  });
}

export function useStopSchedule(patientId: string) {
  const invalidate = useInvalidateSchedules(patientId);
  return useMutation<MedicationSchedule, PatientFailure, string>({
    mutationFn: stopSchedule,
    onSuccess: invalidate,
  });
}
