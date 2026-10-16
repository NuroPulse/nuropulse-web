import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { addMedicine, getMedicine, listMedicines, listMedicineUsage } from "./api";
import type {
  Medicine,
  MedicineFailure,
  MedicineListParams,
  MedicineListResult,
  MedicineUsage,
  NewMedicineInput,
} from "./types";

export const medicineQueryKeys = {
  all: ["medicines"] as const,
  lists: () => [...medicineQueryKeys.all, "list"] as const,
  list: (params: MedicineListParams) => [...medicineQueryKeys.lists(), params] as const,
  detail: (id: string) => [...medicineQueryKeys.all, "detail", id] as const,
  usage: (id: string) => [...medicineQueryKeys.all, "usage", id] as const,
};

export function useMedicines(params: MedicineListParams) {
  return useQuery<MedicineListResult, MedicineFailure>({
    queryKey: medicineQueryKeys.list(params),
    queryFn: () => listMedicines(params),
    // Keep the current page visible while the next page or search result loads.
    placeholderData: keepPreviousData,
  });
}

export function useMedicine(id: string) {
  return useQuery<Medicine | null, MedicineFailure>({
    queryKey: medicineQueryKeys.detail(id),
    queryFn: () => getMedicine(id),
  });
}

export function useMedicineUsage(id: string) {
  return useQuery<MedicineUsage[], MedicineFailure>({
    queryKey: medicineQueryKeys.usage(id),
    queryFn: () => listMedicineUsage(id),
  });
}

export function useAddMedicine() {
  const queryClient = useQueryClient();
  return useMutation<Medicine, MedicineFailure, NewMedicineInput>({
    mutationFn: addMedicine,
    // A new medicine only changes the lists (every page and search); no detail or usage query
    // can be cached for it yet.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: medicineQueryKeys.lists() }),
  });
}
