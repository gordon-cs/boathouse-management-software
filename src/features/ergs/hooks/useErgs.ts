import { useQuery } from "@tanstack/react-query";
import { getErgs } from "../api/ergs.api";

export function useErgs(enabled = true) {
  return useQuery({
    queryKey: ["ergs"],
    queryFn: getErgs,
    enabled,
  });
}
