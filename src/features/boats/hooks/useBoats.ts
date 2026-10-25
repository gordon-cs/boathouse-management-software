import { useQuery } from "@tanstack/react-query";
import { getBoats } from "../api/boats.api";

export function useBoats() {
  return useQuery({
    queryKey: ["boats"],
    queryFn: getBoats,
  });
}
