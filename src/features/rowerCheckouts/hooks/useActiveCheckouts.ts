
import { useQuery } from "@tanstack/react-query";
import { getActiveBoatCheckouts } from "../api/activeCheckouts.api";
import { useActiveCheckoutsRealtime } from "./useActiveCheckoutsRealtime";

export function useActiveCheckouts() {
  useActiveCheckoutsRealtime();

  return useQuery({
    queryKey: ["active-boat-checkouts"],
    queryFn: getActiveBoatCheckouts,
  });
}

