import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBoat,
  getAvailableBoats,
  getBoats,
  retireBoat,
  updateBoat,
} from "../api/boats.api";

export function useBoats(enabled = true) {
  return useQuery({
    queryKey: ["boats"],
    queryFn: getBoats,
    enabled,
  });
}

export function useAvailableBoats(enabled = true) {
  return useQuery({
    queryKey: ["available-boats"],
    queryFn: getAvailableBoats,
    enabled,
  });
}

export function useCreateBoat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBoat,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["boats"] }),
        queryClient.invalidateQueries({ queryKey: ["available-boats"] }),
      ]),
  });
}

export function useUpdateBoat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBoat,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["boats"] }),
        queryClient.invalidateQueries({ queryKey: ["available-boats"] }),
      ]),
  });
}

export function useRetireBoat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retireBoat,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["boats"] }),
        queryClient.invalidateQueries({ queryKey: ["available-boats"] }),
      ]),
  });
}
