import { useQuery } from "@tanstack/react-query";
import { getCheckouts, getAdditionalRowers } from "../api/checkouts.api";

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
