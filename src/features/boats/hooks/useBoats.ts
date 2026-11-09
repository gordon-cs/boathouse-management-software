import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBoat,
  getBoats,
  retireBoat,
  updateBoat,
} from "../api/boats.api";

export function useBoats() {
  return useQuery({
    queryKey: ["boats"],
    queryFn: getBoats,
  });
}

export function useCreateBoat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBoat,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["boats"] }),
  });
}

export function useUpdateBoat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBoat,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["boats"] }),
  });
}

export function useRetireBoat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retireBoat,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["boats"] }),
  });
}
