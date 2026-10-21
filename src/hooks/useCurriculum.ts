"use client";

import { useQuery } from "@tanstack/react-query";
import client from "@/lib/api-client";
import type { CurriculumConfig } from "@/lib/curriculum";

/**
 * Fetches the effective curriculum tree from GET /api/public/curriculum.
 * Server caches for 5 min; client-side we keep the same stale window so
 * multi-step forms don't re-fetch between steps.
 */
export function useCurriculum() {
  return useQuery<CurriculumConfig>({
    queryKey: ["public", "curriculum"],
    queryFn: async () => {
      const res = await client.get<CurriculumConfig>("/public/curriculum");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
