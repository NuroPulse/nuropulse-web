import { useQuery } from "@tanstack/react-query";

import { getPatient, listMyPatients } from "./api";
import type { PatientFailure, PatientListItem } from "./types";

export const patientQueryKeys = {
  all: ["patients"] as const,
  list: () => [...patientQueryKeys.all, "list"] as const,
  detail: (id: string) => [...patientQueryKeys.all, "detail", id] as const,
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
