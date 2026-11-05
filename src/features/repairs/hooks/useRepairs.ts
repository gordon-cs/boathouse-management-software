import { useQuery } from "@tanstack/react-query";
import { getRepairs } from "../api/repairs.api";

export function useRepairs() {
  return useQuery({
    queryKey: ["repair"],
    queryFn: getRepairs,
  });
}
