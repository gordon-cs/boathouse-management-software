
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

export function useActiveCheckoutsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("active-checkout-updates")

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "check_out",
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["active-boat-checkouts"],
          });
          queryClient.invalidateQueries({
            queryKey: ["available-boats"],
          });
        }
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "boat",
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["active-boat-checkouts"],
          });
        }
      )

      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "additional_rower",
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ["active-boat-checkouts"],
          });
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
