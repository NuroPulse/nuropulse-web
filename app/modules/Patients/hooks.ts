import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createSchedule,
  getPatient,
  listMedicationLogs,
  listMyPatients,
  listSchedules,
  stopSchedule,
  updateSchedule,
} from "./api";
import type {
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
};

export function useMyPatients() {
  return useQuery<PatientListItem[], PatientFailure>({
    queryKey: patientQueryKeys.list(),
    queryFn: listMyPatients,
  });
}

export function usePatient(patientId: string) {
  return useQuery<PatientListItem | null, PatientFailure>({
    queryKey: patientQueryKeys.detail(patientId),
    queryFn: () => getPatient(patientId),
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

function useInvalidateSchedules(patientId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: patientQueryKeys.schedules(patientId) });
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
