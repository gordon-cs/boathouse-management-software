import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAdditionalRower,
  createCheckout,
  deleteAdditionalRower,
  getAdditionalRowers,
  getCheckouts,
  updateAdditionalRower,
  updateCheckout,
} from "../api/checkouts.api";

export function useCheckouts() {
  return useQuery({
    queryKey: ["check_out"],
    queryFn: getCheckouts,
  });
}

export function useAdditionalRowers() {
  return useQuery({
    queryKey: ["additional_rower"],
    queryFn: getAdditionalRowers,
  });
}

export function useCreateCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCheckout,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["check_out"] }),
        queryClient.invalidateQueries({ queryKey: ["additional_rower"] }),
      ]),
  });
}

export function useUpdateCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCheckout,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["check_out"] }),
        queryClient.invalidateQueries({ queryKey: ["additional_rower"] }),
      ]),
  });
}

export function useCreateAdditionalRower() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdditionalRower,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["additional_rower"] }),
  });
}

export function useUpdateAdditionalRower() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdditionalRower,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["additional_rower"] }),
  });
}

export function useDeleteAdditionalRower() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdditionalRower,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["additional_rower"] }),
  });
}
