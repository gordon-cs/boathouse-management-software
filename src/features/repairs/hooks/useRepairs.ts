import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createRepair, getRepairs, updateRepair } from "../api/repairs.api";

export function useRepairs() {
  return useQuery({
    queryKey: ["repair"],
    queryFn: getRepairs,
  });
}

export function useCreateRepair() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRepair,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["repair"] }),
  });
}

export function useUpdateRepair() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRepair,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["repair"] }),
  });
}

