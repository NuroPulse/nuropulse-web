import { useQuery } from "@tanstack/react-query";

import { listMyPatients } from "./api";
import type { PatientFailure, PatientListItem } from "./types";

export const patientQueryKeys = {
  all: ["patients"] as const,
  list: () => [...patientQueryKeys.all, "list"] as const,
};

export function useMyPatients() {
  return useQuery<PatientListItem[], PatientFailure>({
    queryKey: patientQueryKeys.list(),
    queryFn: listMyPatients,
  });
}
